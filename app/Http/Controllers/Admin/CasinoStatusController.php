<?php

namespace App\Http\Controllers\Admin;

use App\Events\CasinoStatusChanged;
use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Support\AdminAudit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Throwable;

/**
 * Admin switch that opens or closes the casino for every player.
 */
class CasinoStatusController extends Controller
{
    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate(['open' => ['required', 'boolean']]);
        $open = (bool) $data['open'];

        Setting::write(Setting::CASINO_OPEN, $open);

        AdminAudit::record($request->user(), 'casino.'.($open ? 'open' : 'close'), $open ? 'Casino opened' : 'Casino closed');

        try {
            broadcast(new CasinoStatusChanged($open));
        } catch (Throwable $e) {
            report($e);
        }

        return back();
    }
}
