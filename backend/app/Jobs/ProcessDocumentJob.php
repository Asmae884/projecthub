<?php

namespace App\Jobs;

use App\Models\Document;
use App\Models\GeneratedTask;
use App\Services\RagService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessDocumentJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 180;

    public function __construct(protected Document $document)
    {
    }

    public function handle(RagService $ragService): void
    {

        $this->document->update(['status' => 'processing']);

        try {
            $response = $ragService->ingestDocument(
                disk: $this->document->disk,
                path: $this->document->path,
                filename: $this->document->filename,
                projectId: $this->document->project_id,
                documentId: $this->document->id,
                userId: $this->document->uploaded_by
            );
            if (isset($response['status']) && $response['status'] === 'success') {
                foreach ($response['tasks'] as $taskData) {
                    GeneratedTask::create([
                        'document_id' => $this->document->id,
                        'project_id' => $this->document->project_id,
                        'title' => $taskData['title'],
                        'description' => $taskData['description'],
                        'priority' => $taskData['priority'] ?? 'medium',
                        'estimated_hours' => $taskData['estimated_hours'] ?? null,
                        'due_date' => $taskData['due_date'] ?? null,
                        'status' => 'pending',
                    ]);
                }

                $this->document->update([
                    'status' => 'completed',
                    'metadata' => $response
                ]);
            } else {
                $this->document->update([
                    'status' => 'failed',
                    'error_message' => $response['message'] ?? 'Erreur inconnue'
                ]);
            }

        } catch (\Exception $e) {
            $this->document->update([
                'status' => 'failed',
                'error_message' => $e->getMessage()
            ]);

            throw $e;
        }
    }
}