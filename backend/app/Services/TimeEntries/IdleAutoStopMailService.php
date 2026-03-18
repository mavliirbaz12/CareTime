<?php

namespace App\Services\TimeEntries;

use App\Mail\IdleTimerStoppedMail;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class IdleAutoStopMailService
{
    public function send(User $user, int $idleSeconds, CarbonInterface $stoppedAt): void
    {
        if (!filled($user->email) || $idleSeconds <= 0) {
            return;
        }

        try {
            Mail::to($user->email)->sendNow(
                new IdleTimerStoppedMail(
                    userName: (string) $user->name,
                    idleSeconds: $idleSeconds,
                    stoppedAt: $stoppedAt->copy(),
                    timezone: $this->resolveDisplayTimezone($user),
                )
            );
        } catch (\Throwable $exception) {
            Log::warning('Idle auto-stop email dispatch failed.', [
                'user_id' => $user->id,
                'email' => $user->email,
                'idle_seconds' => $idleSeconds,
                'exception' => $exception::class,
                'message' => $exception->getMessage(),
            ]);
        }
    }

    private function resolveDisplayTimezone(User $user): string
    {
        $candidate = is_array($user->settings)
            ? (string) ($user->settings['timezone'] ?? '')
            : '';

        if ($candidate !== '' && in_array($candidate, timezone_identifiers_list(), true)) {
            return $candidate;
        }

        return (string) config('app.timezone', 'UTC');
    }
}
