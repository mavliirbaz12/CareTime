<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class TaskMultiAssigneeTest extends TestCase
{
    use RefreshDatabase;

    public function test_task_can_be_created_with_multiple_assignees(): void
    {
        $organization = Organization::create([
            'name' => 'CareVance',
            'slug' => 'carevance',
        ]);

        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => 'password123',
            'role' => 'admin',
            'organization_id' => $organization->id,
        ]);

        $firstEmployee = User::create([
            'name' => 'Ayush',
            'email' => 'ayush@example.com',
            'password' => 'password123',
            'role' => 'employee',
            'organization_id' => $organization->id,
        ]);

        $secondEmployee = User::create([
            'name' => 'Zeel',
            'email' => 'zeel@example.com',
            'password' => 'password123',
            'role' => 'employee',
            'organization_id' => $organization->id,
        ]);

        $project = Project::create([
            'organization_id' => $organization->id,
            'name' => 'Core Platform',
            'status' => 'active',
        ]);

        $response = $this->postJson('/api/tasks', [
            'title' => 'Coordinate rollout',
            'project_id' => $project->id,
            'assignee_ids' => [$firstEmployee->id, $secondEmployee->id],
            'status' => 'todo',
            'priority' => 'medium',
        ], $this->apiHeadersFor($admin));

        $response
            ->assertCreated()
            ->assertJsonPath('assignee_id', $firstEmployee->id)
            ->assertJsonCount(2, 'assignees');

        $task = Task::query()->firstOrFail();

        $this->assertSame($firstEmployee->id, $task->assignee_id);
        $this->assertDatabaseHas('task_assignees', [
            'task_id' => $task->id,
            'user_id' => $firstEmployee->id,
        ]);
        $this->assertDatabaseHas('task_assignees', [
            'task_id' => $task->id,
            'user_id' => $secondEmployee->id,
        ]);
    }

    public function test_task_creation_rejects_assignees_from_another_organization(): void
    {
        $organization = Organization::create([
            'name' => 'CareVance',
            'slug' => 'carevance',
        ]);

        $anotherOrganization = Organization::create([
            'name' => 'Outside',
            'slug' => 'outside',
        ]);

        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => 'password123',
            'role' => 'admin',
            'organization_id' => $organization->id,
        ]);

        $insideEmployee = User::create([
            'name' => 'Ayush',
            'email' => 'ayush@example.com',
            'password' => 'password123',
            'role' => 'employee',
            'organization_id' => $organization->id,
        ]);

        $outsideEmployee = User::create([
            'name' => 'Outside Employee',
            'email' => 'outside@example.com',
            'password' => 'password123',
            'role' => 'employee',
            'organization_id' => $anotherOrganization->id,
        ]);

        $project = Project::create([
            'organization_id' => $organization->id,
            'name' => 'Core Platform',
            'status' => 'active',
        ]);

        $this->postJson('/api/tasks', [
            'title' => 'Coordinate rollout',
            'project_id' => $project->id,
            'assignee_ids' => [$insideEmployee->id, $outsideEmployee->id],
        ], $this->apiHeadersFor($admin))
            ->assertUnprocessable()
            ->assertJsonPath('message', 'All assignees must belong to your organization.');

        $this->assertSame(0, Task::count());
        $this->assertSame(0, DB::table('task_assignees')->count());
    }

    public function test_project_tasks_can_be_filtered_by_assignee_including_multi_assignee_tasks(): void
    {
        $organization = Organization::create([
            'name' => 'CareVance',
            'slug' => 'carevance',
        ]);

        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => 'password123',
            'role' => 'admin',
            'organization_id' => $organization->id,
        ]);

        $selectedEmployee = User::create([
            'name' => 'Ayush',
            'email' => 'ayush@example.com',
            'password' => 'password123',
            'role' => 'employee',
            'organization_id' => $organization->id,
        ]);

        $otherEmployee = User::create([
            'name' => 'Zeel',
            'email' => 'zeel@example.com',
            'password' => 'password123',
            'role' => 'employee',
            'organization_id' => $organization->id,
        ]);

        $project = Project::create([
            'organization_id' => $organization->id,
            'name' => 'Core Platform',
            'status' => 'active',
        ]);

        $primaryAssignedTask = Task::create([
            'title' => 'Legacy assigned task',
            'project_id' => $project->id,
            'status' => 'todo',
            'priority' => 'medium',
            'assignee_id' => $selectedEmployee->id,
        ]);

        $multiAssignedTask = Task::create([
            'title' => 'Multi assigned task',
            'project_id' => $project->id,
            'status' => 'todo',
            'priority' => 'medium',
            'assignee_id' => $otherEmployee->id,
        ]);
        $multiAssignedTask->assignees()->sync([$selectedEmployee->id, $otherEmployee->id]);

        $hiddenTask = Task::create([
            'title' => 'Other employee only',
            'project_id' => $project->id,
            'status' => 'todo',
            'priority' => 'medium',
            'assignee_id' => $otherEmployee->id,
        ]);
        $hiddenTask->assignees()->sync([$otherEmployee->id]);

        $this->getJson("/api/projects/{$project->id}/tasks?assignee_id={$selectedEmployee->id}", $this->apiHeadersFor($admin))
            ->assertOk()
            ->assertJsonCount(2)
            ->assertJsonFragment(['title' => $primaryAssignedTask->title])
            ->assertJsonFragment(['title' => $multiAssignedTask->title])
            ->assertJsonMissing(['title' => $hiddenTask->title]);
    }
}
