<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class SessionMonitorController extends Controller
{
    /**
     * Show the host/monitor view for one hosted session.
     */
    public function show(string $session): Response
    {
        return Inertia::render('admin/session-monitor', [
            'sessionId' => $session,
        ]);
    }
}
