<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    use HasSeo;

    protected $fillable = [
        'title', 'slug', 'short_description', 'category_id', 'client_name', 'location', 'project_type', 'area', 'area_unit',
        'duration', 'completion_year', 'status', 'is_featured', 'published_at', 'cover_image', 'video_url', 'highlights',
        'about_heading', 'about_description', 'objectives', 'design_approach', 'execution_details',
    ];
    protected $casts = ['highlights' => 'array', 'is_featured' => 'boolean', 'published_at' => 'datetime'];

    public function category(): BelongsTo { return $this->belongsTo(Category::class, 'category_id'); }
    public function images(): HasMany { return $this->hasMany(ProjectImage::class)->orderBy('sort_order'); }
    public function scopeItems(): HasMany { return $this->hasMany(ProjectScopeItem::class)->orderBy('sort_order'); }
    public function results(): HasMany { return $this->hasMany(ProjectResult::class)->orderBy('sort_order'); }

    public function scopePublished(Builder $q): Builder { return $q->where('status', 'published'); }
}
