<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeadResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $l = $this->resource;
        return [
            'id' => $l->id, 'name' => $l->name, 'company' => $l->company, 'email' => $l->email, 'phone' => $l->phone,
            'project_type' => $l->project_type, 'location' => $l->location, 'budget' => $l->budget, 'message' => $l->message,
            'status' => $l->status, 'assigned_to' => $l->assigned_to, 'follow_up_date' => $l->follow_up_date?->format('Y-m-d'),
            'created_at' => $l->created_at?->toIso8601String(),
            'notes' => $l->notes->map(fn ($n) => ['at' => $n->created_at->toIso8601String(), 'text' => $n->text])->values(),
            'history' => $l->events->map(fn ($e) => ['at' => $e->created_at->toIso8601String(), 'text' => $e->text])->values(),
        ];
    }
}
