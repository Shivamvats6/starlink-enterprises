<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TeamMember extends Model
{
    protected $fillable = ['name', 'role', 'photo', 'is_published'];
    protected $casts = ['is_published' => 'boolean'];
}
