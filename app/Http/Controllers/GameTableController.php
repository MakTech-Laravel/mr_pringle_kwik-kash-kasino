<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GameTableController extends Controller
{
    /**
     * Show a player-facing game table (demo UI only; state is mocked on the client).
     */
    public function show(Request $request, string $game, string $session): Response
    {
        abort_unless(in_array($game, ['poker', 'blackjack', 'roulette'], true), 404);

        return Inertia::render('games/'.$game, [
            'sessionId' => $session,
        ]);
    }
}
