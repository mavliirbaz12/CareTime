<?php

namespace Tests\Feature;

use App\Mail\IdleTimerStoppedMail;
use App\Models\AppNotification;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class AttendanceIdleAlertTest extends TestCase
{
    use RefreshDatabase;

    public function test_employee_idle_stop_alert_sends_mail_and_creates_notification(): void
    {
        Mail::fake();

        $organization = Organization::create([
            'name' => 'CareVance',
            'slug' => 'carevance',
        ]);

        $employee = User::factory()->create([
            'organization_id' => $organization->id,
            'role' => 'employee',
            'email' => 'employee@example.com',
            'name' => 'Employee User',
        ]);

        $response = $this->postJson('/api/attendance/idle-stop-alert', [
            'idle_seconds' => 10,
            'stopped_at' => '2026-03-18T12:00:00Z',
            'timezone' => 'Asia/Kolkata',
        ], $this->apiHeadersFor($employee));

        $response
            ->assertCreated()
            ->assertJsonPath('message', 'Idle stop alert sent.');

        Mail::assertSent(IdleTimerStoppedMail::class, function (IdleTimerStoppedMail $mail) use ($employee) {
            return $mail->hasTo($employee->email)
                && $mail->idleSeconds === 10
                && $mail->userName === 'Employee User'
                && $mail->timezone === 'Asia/Kolkata';
        });

        $notification = AppNotification::query()->latest('id')->first();
        $this->assertNotNull($notification);
        $this->assertSame($employee->id, $notification->user_id);
        $this->assertSame('Timer Stopped After Idle Time', $notification->title);
        $this->assertStringContainsString('10 seconds', $notification->message);
    }
}
