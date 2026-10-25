<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\LeadResource;
use App\Models\{ActivityLog, Lead, LeadEvent, LeadNote};
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LeadController extends Controller
{
    public function index(Request $r)
    {
        $q = Lead::with(['notes', 'events'])->latest();
        if ($s = $r->query('q')) $q->where(fn ($w) => $w->where('name', 'like', "%{$s}%")->orWhere('email', 'like', "%{$s}%")->orWhere('phone', 'like', "%{$s}%"));
        if ($st = $r->query('status')) $q->where('status', $st);
        if ($f = $r->query('from')) $q->whereDate('created_at', '>=', $f);
        if ($t = $r->query('to')) $q->whereDate('created_at', '<=', $t);
        if ($r->boolean('all')) return LeadResource::collection($q->get());
        return LeadResource::collection($q->paginate(min(max((int) $r->query('per_page', 10), 1), 100)));
    }

    public function show(int $id) { return new LeadResource(Lead::with(['notes', 'events'])->findOrFail($id)); }

    public function update(Request $r, int $id)
    {
        $lead = Lead::findOrFail($id);
        $d = $r->validate([
            'status' => ['sometimes', Rule::in(Lead::STATUSES)], 'assigned_to' => ['sometimes', 'nullable', 'string', 'max:255'],
            'follow_up_date' => ['sometimes', 'nullable', 'date'], 'notes' => ['sometimes', 'array'], 'notes.*.text' => ['required', 'string', 'max:2000'],
        ]);
        if (isset($d['status']) && $d['status'] !== $lead->status) LeadEvent::create(['lead_id' => $lead->id, 'text' => "Status changed to {$d['status']}"]);
        if (array_key_exists('assigned_to', $d) && $d['assigned_to'] !== $lead->assigned_to) LeadEvent::create(['lead_id' => $lead->id, 'text' => 'Assigned to ' . ($d['assigned_to'] ?: 'nobody')]);
        if (array_key_exists('follow_up_date', $d) && $d['follow_up_date'] != $lead->follow_up_date?->format('Y-m-d')) LeadEvent::create(['lead_id' => $lead->id, 'text' => 'Follow-up date set']);
        $lead->update(collect($d)->only(['status', 'assigned_to', 'follow_up_date'])->all());

        // The client sends the full notes list; only entries beyond the stored count are new.
        if (isset($d['notes'])) {
            $existing = $lead->notes()->count();
            foreach (array_slice($d['notes'], $existing) as $n) {
                LeadNote::create(['lead_id' => $lead->id, 'user_id' => $r->user()->id, 'text' => strip_tags($n['text'])]);
                LeadEvent::create(['lead_id' => $lead->id, 'text' => 'Note added']);
            }
        }
        ActivityLog::record("Lead \"{$lead->name}\" updated");
        return new LeadResource($lead->fresh(['notes', 'events']));
    }

    public function destroy(int $id)
    {
        Lead::findOrFail($id)->delete();
        ActivityLog::record('Lead deleted');
        return response()->noContent();
    }
}
