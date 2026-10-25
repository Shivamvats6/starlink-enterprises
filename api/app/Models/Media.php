<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Media extends Model
{
    protected $table = 'media';
    protected $fillable = ['name', 'path', 'alt', 'size', 'mime', 'width', 'height', 'user_id'];
    protected $appends = ['url'];
    protected $hidden = ['path'];

    public function getUrlAttribute(): string
    {
        return Storage::disk('public')->url($this->path);
    }
}
