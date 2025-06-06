# Usar PHP 8.2 con Apache
FROM php:8.2-apache

# Actualizar repositorios
RUN apt-get update

# Instalar dependencias básicas
RUN apt-get install -y \
    git \
    curl \
    zip \
    unzip \
    postgresql-client

# Instalar dependencias para extensiones PHP
RUN apt-get install -y \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libpq-dev

# Instalar extensiones PHP básicas
RUN docker-php-ext-install mbstring exif pcntl bcmath gd

# Instalar extensiones PostgreSQL por separado
RUN docker-php-ext-install pdo_pgsql pgsql

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configurar Apache
RUN a2enmod rewrite
COPY 000-default.conf /etc/apache2/sites-available/000-default.conf

# Establecer directorio de trabajo
WORKDIR /var/www/html

# Copiar archivos de la aplicación
COPY . .

# Instalar dependencias de Composer
RUN composer install --no-dev --optimize-autoloader

# Crear archivo .env línea por línea para asegurar formato correcto
RUN echo "APP_NAME=Actividades" > .env && \
    echo "APP_ENV=production" >> .env && \
    echo "APP_KEY=base64:YourBase64SecretKeyHere1234567890ABCDEFGHIJ=" >> .env && \
    echo "APP_DEBUG=false" >> .env && \
    echo "APP_URL=https://actividades-backend.onrender.com" >> .env && \
    echo "LOG_CHANNEL=stderr" >> .env && \
    echo "LOG_DEPRECATIONS_CHANNEL=null" >> .env && \
    echo "LOG_LEVEL=debug" >> .env && \
    echo "DB_CONNECTION=pgsql" >> .env && \
    echo "DB_HOST=" >> .env && \
    echo "DB_PORT=5432" >> .env && \
    echo "DB_DATABASE=" >> .env && \
    echo "DB_USERNAME=" >> .env && \
    echo "DB_PASSWORD=" >> .env && \
    echo "BROADCAST_DRIVER=log" >> .env && \
    echo "CACHE_DRIVER=file" >> .env && \
    echo "FILESYSTEM_DISK=local" >> .env && \
    echo "QUEUE_CONNECTION=sync" >> .env && \
    echo "SESSION_DRIVER=file" >> .env && \
    echo "SESSION_LIFETIME=120" >> .env && \
    echo "DB_SSLMODE=require" >> .env && \
    echo "PGSSLCERT=" >> .env && \
    echo "PGSSLKEY=" >> .env && \
    echo "PGSSLROOTCERT=" >> .env

# Establecer permisos
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

# Exponer puerto
EXPOSE 80

# Comando de inicio simple con verificación de .env
CMD ["sh", "-c", "echo 'Iniciando Laravel...' && echo 'Contenido de .env:' && cat .env && echo '--- Fin .env ---' && echo 'Migrando DB...' && php artisan migrate --force && echo 'Sembrando datos...' && php artisan db:seed --force && echo 'Iniciando Apache...' && apache2-foreground"]
