<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectScopeItem extends Model
{
    protected $fillable = ['project_id', 'title', 'description', 'icon', 'sort_order'];
}
