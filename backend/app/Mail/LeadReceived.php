<?php

namespace App\Mail;

use App\Models\Lead;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class LeadReceived extends Mailable
{
    public function __construct(public Lead $lead) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'New website enquiry from ' . $this->lead->name, replyTo: [$this->lead->email]);
    }

    public function content(): Content
    {
        return new Content(view: 'emails.lead-received');
    }
}
