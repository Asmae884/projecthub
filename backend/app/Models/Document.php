<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'filename',
        'path',
        'disk',
        'status',
        'metadata',
        'error_message',
        'uploaded_by',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function generatedTasks()
    {
        return $this->hasMany(GeneratedTask::class);
    }
}