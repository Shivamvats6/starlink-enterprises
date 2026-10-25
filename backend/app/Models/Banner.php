<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    protected $fillable = ['heading', 'subheading', 'cta_label', 'cta_url', 'secondary_cta_label', 'secondary_cta_url', 'desktop_image', 'mobile_image', 'focal_x', 'focal_y', 'display_order', 'is_active'];
    protected $casts = ['is_active' => 'boolean'];
}
