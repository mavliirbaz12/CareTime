<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('task_assignees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['task_id', 'user_id'], 'task_assignees_task_user_unique');
        });

        $now = now();
        $rows = DB::table('tasks')
            ->whereNotNull('assignee_id')
            ->select('id', 'assignee_id')
            ->get()
            ->map(fn ($task) => [
                'task_id' => $task->id,
                'user_id' => $task->assignee_id,
                'created_at' => $now,
                'updated_at' => $now,
            ])
            ->unique(fn (array $row) => $row['task_id'].'|'.$row['user_id'])
            ->values()
            ->all();

        if ($rows !== []) {
            DB::table('task_assignees')->insert($rows);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('task_assignees');
    }
};
