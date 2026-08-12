<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GeneratedTask extends Model
{
    use HasFactory;

    protected $fillable = [
        'document_id',
        'project_id',
        'title',
        'description',
        'priority',
        'estimated_hours',
        'due_date',
        'status',
    ];

    public function document()
    {
        return $this->belongsTo(Document::class);
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }
}