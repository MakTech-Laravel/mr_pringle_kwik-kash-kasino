<?php

namespace App\Http\Controllers;

use App\Support\TableParticipation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GameTableController extends Controller
{
    /**
     * Show a game table. Players always sit as players. An admin must choose
     * `?as=host` or `?as=player`, and cannot hold both at the same session.
     */
    public function show(Request $request, TableParticipation $participation, string $game, string $session): Response|RedirectResponse
    {
        abort_unless(in_array($game, ['poker', 'blackjack', 'roulette'], true), 404);

        $user = $request->user();
        $mode = TableParticipation::PLAYER;

        if ($user->isAdmin()) {
            $mode = $request->query('as');

            if (! in_array($mode, [TableParticipation::HOST, TableParticipation::PLAYER], true)) {
                return redirect()->route('admin.sessions');
            }
        }

        if (! $participation->join($session, $mode)) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => "You already hold the {$participation->current($session)} seat in {$session}. Leave the table before joining as {$mode}.",
            ]);

            return redirect()->route('admin.sessions');
        }

        return Inertia::render('games/'.$game, [
            'sessionId' => $session,
            'mode' => $mode,
        ]);
    }

    /**
     * Leave a table, releasing the host or player seat held in this session.
     */
    public function leave(Request $request, TableParticipation $participation, string $session): RedirectResponse
    {
        $participation->leave($session);

        return redirect()->route(
            $request->user()->isAdmin() ? 'admin.sessions' : 'lobby.sessions',
        );
    }
}
