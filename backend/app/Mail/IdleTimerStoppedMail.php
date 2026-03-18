<?php

namespace App\Mail;

use Carbon\Carbon;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class IdleTimerStoppedMail extends Mailable
{
    public function __construct(
        public readonly string $userName,
        public readonly int $idleSeconds,
        public readonly Carbon $stoppedAt,
        public readonly string $timezone,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your CareVance timer stopped after idle time',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.idle-timer-stopped',
            with: [
                'userName' => $this->userName,
                'idleSeconds' => $this->idleSeconds,
                'stoppedAt' => $this->stoppedAt,
                'timezone' => $this->timezone,
            ],
        );
    }
}
