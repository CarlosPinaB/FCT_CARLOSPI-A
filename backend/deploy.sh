#!/bin/bash

echo "🚀 Iniciando deployment del backend Laravel..."

# Instalar dependencias de Composer (sin dev dependencies)
echo "📦 Instalando dependencias de Composer..."
composer install --no-dev --optimize-autoloader

# Generar key si no existe
if [ -z "$APP_KEY" ]; then
    echo "🔑 Generando APP_KEY..."
    php artisan key:generate --force
fi

# Cache de configuración para producción
echo "⚡ Optimizando configuración..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Ejecutar migraciones
echo "🗄️ Ejecutando migraciones de base de datos..."
php artisan migrate --force

# Ejecutar seeders (solo categorías básicas)
echo "🌱 Ejecutando seeders básicos..."
php artisan db:seed --class=CategorySeeder --force

echo "✅ Deployment completado!"
echo "🌍 La API estará disponible en $RENDER_EXTERNAL_URL"
