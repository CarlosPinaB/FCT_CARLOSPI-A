<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    /** @use HasFactory<\Database\Factories\ActivityFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'start_date',
        'end_date',
        'max_participants',
        'location',
        'is_active',
        'category_id',
        'user_id'
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime'
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function teacher()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }

    public function participants()
    {
        return $this->belongsToMany(User::class, 'enrollments')
            ->withPivot('status')
            ->withTimestamps();
    }

    public function approvedParticipants()
    {
        return $this->belongsToMany(User::class, 'enrollments')
            ->withPivot('status')
            ->withTimestamps()
            ->wherePivot('status', 'approved');
    }

    // Accessor para current_participants
    public function getCurrentParticipantsAttribute()
    {
        return $this->enrollments()->where('status', 'approved')->count();
    }
}
