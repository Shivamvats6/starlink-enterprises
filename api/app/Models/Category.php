<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $table = 'project_categories';
    protected $fillable = ['name', 'slug'];
}
