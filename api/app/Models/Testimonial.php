<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Testimonial extends Model
{
    protected $fillable = ['name', 'role', 'location', 'quote', 'rating', 'is_approved'];
    protected $casts = ['is_approved' => 'boolean'];
}
