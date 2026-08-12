<?php

namespace App\Providers;
 
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Storage;
use Illuminate\Filesystem\FilesystemAdapter;
use League\Flysystem\Filesystem;
use League\Flysystem\AzureBlobStorage\AzureBlobStorageAdapter;
use MicrosoftAzure\Storage\Blob\BlobRestProxy;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }


    public function boot(): void
    {
        // Enregistre le driver "azure" pour le système de fichiers Laravel.
        // league/flysystem-azure-blob-storage ne fait que fournir l'adaptateur
        // Flysystem — Laravel ne sait pas l'utiliser tant qu'on ne le lui dit pas.
        Storage::extend('azure', function ($app, $config) {
            $client = BlobRestProxy::createBlobService($config['connection_string']);
            $adapter = new AzureBlobStorageAdapter($client, $config['container']);
            $filesystem = new Filesystem($adapter);
 
            return new FilesystemAdapter($filesystem, $adapter, $config);
        });
    }
}