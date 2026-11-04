<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    protected $fillable = ['eyebrow', 'heading', 'subheading', 'cta_label', 'cta_url', 'secondary_cta_label', 'secondary_cta_url', 'desktop_image', 'mobile_image','mobile_text_theme', 'focal_x', 'focal_y', 'slide_seconds', 'display_order', 'features', 'is_active'];
    protected $casts = ['is_active' => 'boolean', 'slide_seconds' => 'integer', 'features' => 'array'];
}
