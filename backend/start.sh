#!/bin/bash

echo "🚀 Iniciando aplicación Laravel..."

# Esperar a que la base de datos esté disponible
echo "⏳ Esperando a que la base de datos PostgreSQL esté disponible..."
while ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME"; do
    echo "⏳ Base de datos no disponible, esperando 3 segundos..."
    sleep 3
done

echo "✅ Base de datos conectada!"

# Ejecutar migraciones y configuración
echo "🔧 Ejecutando configuración de Laravel..."
php artisan key:generate --force
php artisan migrate --force
php artisan db:seed --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan storage:link

echo "✅ Configuración completada!"

# Iniciar Apache
echo "🌐 Iniciando servidor web..."
apache2-foreground
