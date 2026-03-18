<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\IdleTimerStoppedMail;
use App\Services\AppNotificationService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class AttendanceIdleAlertController extends Controller
{
    public function __construct(
        private readonly AppNotificationService $notificationService,
    ) {
    }

    public function store(Request $request)
    {
        $request->validate([
            'idle_seconds' => 'required|integer|min:1|max:3600',
            'stopped_at' => 'nullable|date',
            'timezone' => 'nullable|string|timezone',
        ]);

        $currentUser = $request->user();
        if (!$currentUser || !$currentUser->organization_id) {
            return response()->json(['message' => 'Organization is required.'], 422);
        }

        $idleSeconds = (int) $request->integer('idle_seconds');
        $stoppedAt = $request->filled('stopped_at')
            ? Carbon::parse((string) $request->input('stopped_at'))
            : now();
        $timezone = $request->filled('timezone')
            ? (string) $request->input('timezone')
            : (string) config('app.timezone');
        $localizedStoppedAt = $stoppedAt->copy()->timezone($timezone);

        $message = sprintf(
            'Your timer was stopped automatically after %s of idle time at %s.',
            $this->formatDuration($idleSeconds),
            $localizedStoppedAt->format('h:i:s A T')
        );

        $this->notificationService->sendToUsers(
            organizationId: (int) $currentUser->organization_id,
            userIds: collect([(int) $currentUser->id]),
            senderId: null,
            type: 'announcement',
            title: 'Timer Stopped After Idle Time',
            message: $message,
            meta: [
                'idle_seconds' => $idleSeconds,
                'stopped_at' => $stoppedAt->toIso8601String(),
                'timezone' => $timezone,
                'source' => 'desktop_idle_auto_stop',
            ]
        );

        Mail::to($currentUser->email)->sendNow(
            new IdleTimerStoppedMail(
                userName: (string) $currentUser->name,
                idleSeconds: $idleSeconds,
                stoppedAt: $stoppedAt,
                timezone: $timezone
            )
        );

        return response()->json([
            'message' => 'Idle stop alert sent.',
        ], 201);
    }

    private function formatDuration(int $seconds): string
    {
        if ($seconds < 60) {
            return $seconds.' seconds';
        }

        $minutes = intdiv($seconds, 60);
        $remainingSeconds = $seconds % 60;

        if ($remainingSeconds === 0) {
            return $minutes.' minute'.($minutes === 1 ? '' : 's');
        }

        return sprintf(
            '%d minute%s %d second%s',
            $minutes,
            $minutes === 1 ? '' : 's',
            $remainingSeconds,
            $remainingSeconds === 1 ? '' : 's'
        );
    }
}
