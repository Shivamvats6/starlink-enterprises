<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lead extends Model
{
    public const STATUSES = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Converted', 'Closed'];

    protected $fillable = ['name', 'company', 'email', 'phone', 'project_type', 'location', 'budget', 'message', 'status', 'assigned_to', 'follow_up_date', 'ip_address'];
    protected $casts = ['follow_up_date' => 'date:Y-m-d'];

    public function notes(): HasMany { return $this->hasMany(LeadNote::class)->oldest(); }
    public function events(): HasMany { return $this->hasMany(LeadEvent::class)->oldest(); }
}
