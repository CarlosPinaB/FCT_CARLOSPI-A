#!/bin/bash

echo "🚀 Iniciando aplicación Laravel..."

# Nota: Laravel manejará la conexión a la base de datos automáticamente
echo "🚀 Iniciando configuración de Laravel..."

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
