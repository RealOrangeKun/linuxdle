#!/bin/bash
# Database seeding script for Linuxdle
# Connects to the PostgreSQL container and runs the seed script

set -e

echo "🔍 Finding PostgreSQL container..."
CONTAINER_NAME="linuxdle-postgres"

# Check if container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "❌ Error: Container ${CONTAINER_NAME} is not running"
    exit 1
fi

# Get container IP
DB_HOST=$(docker inspect ${CONTAINER_NAME} --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}')
if [ -z "$DB_HOST" ]; then
    echo "❌ Error: Could not get container IP address"
    exit 1
fi
echo "✓ Container IP: ${DB_HOST}"

# Get database password from container
DB_PASSWORD=$(docker exec ${CONTAINER_NAME} env | grep POSTGRES_PASSWORD | cut -d'=' -f2-)
if [ -z "$DB_PASSWORD" ]; then
    echo "❌ Error: Could not get database password"
    exit 1
fi
echo "✓ Database password retrieved"

# Get database name and user (with defaults)
DB_NAME=$(docker exec ${CONTAINER_NAME} env | grep POSTGRES_DB | cut -d'=' -f2-)
DB_USER=$(docker exec ${CONTAINER_NAME} env | grep POSTGRES_USER | cut -d'=' -f2-)
DB_NAME=${DB_NAME:-linuxdle}
DB_USER=${DB_USER:-linuxdle}

echo ""
echo "🌱 Seeding database..."
echo "   Host: ${DB_HOST}"
echo "   Database: ${DB_NAME}"
echo "   User: ${DB_USER}"
echo ""

# Run the seed script
DB_HOST="${DB_HOST}" \
DB_NAME="${DB_NAME}" \
DB_USER="${DB_USER}" \
DB_PASSWORD="${DB_PASSWORD}" \
python3 seed_db.py

echo ""
echo "✅ Database seeding complete!"
