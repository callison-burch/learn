#!/usr/bin/env bash
# Simple database backup script
DATE=$(date +"%Y%m%d_%H%M%S")
pg_dump "$DATABASE_URL" > "backup_$DATE.sql"
