<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsPlayer
{
    /**
     * Keep the player panel for players. An admin who opens a player-only URL
     * is sent back to the admin console; admins join tables per session instead.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user?->isAdmin()) {
            return redirect()->route($user->role->homeRouteName());
        }

        return $next($request);
    }
}
