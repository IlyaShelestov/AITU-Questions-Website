#!/bin/sh
set -e

echo "Running database migrations…"

echo "Populating database..."
npm run populate

echo "Starting server…"
npm start
