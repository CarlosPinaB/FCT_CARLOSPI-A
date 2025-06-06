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

# Crear archivo .env base con todas las variables necesarias
RUN echo "APP_NAME=Actividades\nAPP_ENV=production\nAPP_KEY=\nAPP_DEBUG=false\nAPP_URL=https://actividades-backend.onrender.com\nLOG_CHANNEL=stderr\nLOG_DEPRECATIONS_CHANNEL=null\nLOG_LEVEL=debug\nDB_CONNECTION=pgsql\nDB_HOST=\nDB_PORT=5432\nDB_DATABASE=\nDB_USERNAME=\nDB_PASSWORD=\nBROADCAST_DRIVER=log\nCACHE_DRIVER=file\nFILESYSTEM_DISK=local\nQUEUE_CONNECTION=sync\nSESSION_DRIVER=file\nSESSION_LIFETIME=120" > .env

# Establecer permisos
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

# Exponer puerto
EXPOSE 80

# Comando de inicio simple
CMD ["sh", "-c", "echo 'Iniciando Laravel...' && php artisan key:generate --force && echo 'Migrando DB...' && php artisan migrate --force && echo 'Sembrando datos...' && php artisan db:seed --force && echo 'Iniciando Apache...' && apache2-foreground"]
