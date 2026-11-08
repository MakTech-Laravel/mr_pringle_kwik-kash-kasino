<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class PasswordAppealCode extends Mailable
{
    use Queueable;

    public function __construct(
        public readonly string $username,
        public readonly string $code,
        public readonly int $minutes,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: config('app.name').' password appeal: your verification code');
    }

    public function content(): Content
    {
        return new Content(text: 'mail.password-appeal-code');
    }
}
