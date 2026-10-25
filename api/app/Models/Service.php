<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasSeo;

    protected $fillable = ['title', 'slug', 'short_description', 'description', 'icon', 'cover_image', 'scope', 'display_order', 'is_published'];
    protected $casts = ['scope' => 'array', 'is_published' => 'boolean'];
    protected $appends = ['seo'];
    protected $hidden = ['seoMeta'];
}
