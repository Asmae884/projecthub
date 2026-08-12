#!/bin/bash

echo " Starting ProjectHub Backend..."

echo " Waiting for database connection..."

max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    attempt=$((attempt+1))

    php -r "
    try {
        \$pdo = new PDO(
            'mysql:host='.getenv('DB_HOST').';port='.getenv('DB_PORT').';dbname='.getenv('DB_DATABASE'),
            getenv('DB_USERNAME'),
            getenv('DB_PASSWORD')
        );
        echo ' Database connected'.PHP_EOL;
        exit(0);

    } catch (Exception \$e) {
        echo ' ERROR: '.\$e->getMessage().PHP_EOL;
        exit(1);
    }
    "

    if [ $? -eq 0 ]; then
        break
    fi

    echo " Database not ready. Attempt $attempt/$max_attempts..."
    sleep 3
done

echo " Clearing Laravel cache..."

php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear


echo " Running migrations..."
php artisan migrate --force || echo " Migrations failed"


echo " Running seeders..."
php artisan db:seed --force || echo " Seeders failed"


echo " Starting Laravel server..."
php artisan serve --host=0.0.0.0 --port=8000