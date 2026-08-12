<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class RagService
{
    protected string $baseUrl;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('services.rag.url', 'http://rag.internal.azure.com:8001'), '/');
    }

    public function ingestDocument(string $disk, string $path, string $filename, int $projectId, int $documentId, ?int $userId): array
    {
        $fileContent = Storage::disk($disk)->get($path);

        if ($fileContent === null) {
            Log::error('Fichier introuvable pour ingestion RAG', [
                'disk' => $disk,
                'path' => $path,
                'document_id' => $documentId,
            ]);

            return [
                'status' => 'error',
                'message' => "Fichier introuvable sur le disque '{$disk}' au chemin '{$path}'",
            ];
        }

        $payload = [
            'file_content' => base64_encode($fileContent),
            'filename' => $filename,
            'project_id' => $projectId,
            'document_id' => $documentId,
            'user_id' => $userId,
        ];

        try {
            $url = $this->baseUrl . '/api/v1/ingest';
            $response = Http::timeout(120) 
                ->post($url, $payload);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('Erreur RAG ingest', [
                'url' => $url,
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            return [
                'status' => 'error',
                'message' => $response->body()
            ];

        } catch (\Exception $e) {
            Log::error('Exception RAG ingest', ['message' => $e->getMessage()]);
            return [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }
    }

    public function healthCheck(): bool
    {
        try {
            $response = Http::timeout(5)->get("{$this->baseUrl}/api/v1/health");
            return $response->successful();
        } catch (\Exception $e) {
            return false;
        }
    }
}