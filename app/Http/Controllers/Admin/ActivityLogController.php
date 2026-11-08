<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Support\AdminAudit;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

/**
 * Read-only view of what administrators did.
 */
class ActivityLogController extends Controller
{
    public function index(): Response
    {
        $activities = AdminAudit::query()
            ->with('causer:id,name,username')
            ->latest('id')
            ->limit(300)
            ->get()
            ->map(fn (Activity $activity) => [
                'id' => 'ACT-'.str_pad((string) $activity->id, 5, '0', STR_PAD_LEFT),
                'admin' => $activity->causer?->name ?? 'Removed administrator',
                'action' => $activity->event ?? 'activity',
                'record' => $activity->description,
                'date' => $activity->created_at?->format('M d, Y H:i'),
            ]);

        return Inertia::render('admin/activity', ['activities' => $activities]);
    }
}
