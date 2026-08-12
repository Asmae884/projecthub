<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\GeneratedTask;
use App\Jobs\ProcessDocumentJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class DocumentController extends Controller
{

    public function upload(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'project_id' => 'required|exists:projects,id',
            'file' => 'required|file|mimes:pdf,docx|max:20480', // 20MB max
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

         $file = $request->file('file');
        $path = $file->store('documents', 'azure');
        $document = Document::create([
            'project_id' => $request->project_id,
            'filename' => $file->getClientOriginalName(),
            'path' => $path,
            'disk' => 'azure',
            'status' => 'pending',
            'uploaded_by'=>auth()->id(),
        ]);

      
        ProcessDocumentJob::dispatch($document);

        return response()->json([
            'message' => 'Document uploadé avec succès. L\'analyse est en cours.',
            'document_id' => $document->id
        ], 202);
    }

    public function status(Document $document)
    {
        return response()->json([
            'document' => $document,
            'tasks' => $document->generatedTasks,
        ]);
    }

public function getGeneratedTasks($projectId)
{
    $tasks = GeneratedTask::where('project_id', $projectId)
        ->with('document')
        ->get();

    return response()->json($tasks);
}

    public function validateTask(GeneratedTask $generatedTask)
    {

        $task = \App\Models\Task::create([
            'project_id' => $generatedTask->project_id,
            'title' => $generatedTask->title,
            'description' => $generatedTask->description,
            'priority' => $generatedTask->priority,
            'status' => 'pending',
            'created_by' => auth()->id(),
        ]);

        $generatedTask->update(['status' => 'validated']);

        return response()->json([
            'message' => 'Tâche validée avec succès',
            'task' => $task
        ]);
    }


    public function rejectTask(GeneratedTask $generatedTask)
    {
        $generatedTask->update(['status' => 'rejected']);
        return response()->json(['message' => 'Tâche rejetée']);
    }
}