#!/bin/bash

echo "[AUTH-STARTUP] Setting up database (drop, create, migrate, seed)..."
npm run db-all

echo "[AUTH-STARTUP] Starting authentication service..."
npm start
echo "[AUTH-STARTUP] Running database migrations..."
npm run migrations

echo "[AUTH-STARTUP] Seeding database with test data..."
npm run db-seed

echo "[AUTH-STARTUP] Starting authentication service..."
npm start