<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    protected $fillable = ['user_id', 'text'];

    public static function record(string $text): void
    {
        static::create(['user_id' => auth()->id(), 'text' => $text]);
    }
}
