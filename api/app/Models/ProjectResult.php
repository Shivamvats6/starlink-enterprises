<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectResult extends Model
{
    protected $fillable = ['project_id', 'value', 'title', 'description', 'icon', 'sort_order'];
}
