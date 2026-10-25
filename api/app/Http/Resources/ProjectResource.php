<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $p = $this->resource;
        return [
            'id' => $p->id, 'title' => $p->title, 'slug' => $p->slug, 'short_description' => $p->short_description,
            'category_id' => $p->category_id, 'category' => $p->category?->name ?? '',
            'client_name' => $p->client_name, 'location' => $p->location, 'project_type' => $p->project_type,
            'area' => $p->area, 'area_unit' => $p->area_unit, 'duration' => $p->duration, 'completion_year' => $p->completion_year,
            'status' => $p->status, 'is_featured' => $p->is_featured, 'published_at' => $p->published_at?->toIso8601String(),
            'created_at' => $p->created_at?->toIso8601String(),
            'cover_image' => $p->cover_image ?? '', 'video_url' => $p->video_url,
            'highlights' => $p->highlights ?? [],
            'gallery' => $p->images->map(fn ($i) => ['id' => $i->id, 'url' => $i->url, 'alt' => $i->alt ?? ''])->values(),
            'about_heading' => $p->about_heading, 'about_description' => $p->about_description,
            'objectives' => $p->objectives, 'design_approach' => $p->design_approach, 'execution_details' => $p->execution_details,
            'scope' => $p->scopeItems->map(fn ($s) => ['id' => $s->id, 'title' => $s->title, 'description' => $s->description ?? '', 'icon' => $s->icon])->values(),
            'results' => $p->results->map(fn ($r) => ['id' => $r->id, 'value' => $r->value, 'title' => $r->title, 'description' => $r->description, 'icon' => $r->icon])->values(),
            'seo' => $p->seo,
        ];
    }
}
