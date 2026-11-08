<?php

use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

/*
 * A user may only subscribe to their own private channel.
 */
Broadcast::channel('App.Models.User.{id}', function (User $user, int $id): bool {
    return $user->id === $id;
});
