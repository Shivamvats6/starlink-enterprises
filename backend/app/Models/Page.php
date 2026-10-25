<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Page extends Model
{
    use HasSeo;

    protected $fillable = ['title', 'slug', 'content', 'is_published'];
    protected $casts = ['is_published' => 'boolean'];
    protected $appends = ['seo'];
    protected $hidden = ['seoMeta'];
}
