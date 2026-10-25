<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SeoMetadata extends Model
{
    protected $table = 'seo_metadata';
    protected $fillable = ['meta_title', 'meta_description', 'focus_keyword', 'canonical_url', 'og_image', 'noindex'];
    protected $casts = ['noindex' => 'boolean'];
}
