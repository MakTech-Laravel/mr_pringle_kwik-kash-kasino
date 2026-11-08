<?php

namespace App\Enums;

enum AppealStatus: string
{
    /** Submitted but the email address is not proven yet; never shown to admins. */
    case Unverified = 'unverified';
    case Pending = 'pending';
    case Resolved = 'resolved';
    case Rejected = 'rejected';
}
