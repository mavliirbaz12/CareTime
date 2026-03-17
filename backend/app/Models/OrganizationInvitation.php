<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrganizationInvitation extends Model
{
    protected $fillable = [
        'organization_id',
        'invited_by_user_id',
        'accepted_user_id',
        'name',
        'email',
        'role',
        'settings',
        'group_ids',
        'token',
        'status',
        'expires_at',
        'responded_at',
    ];

    protected function casts(): array
    {
        return [
            'settings' => 'array',
            'group_ids' => 'array',
            'expires_at' => 'datetime',
            'responded_at' => 'datetime',
        ];
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function invitedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invited_by_user_id');
    }

    public function acceptedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'accepted_user_id');
    }
}
