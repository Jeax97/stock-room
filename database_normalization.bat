@echo off
echo ========================================
echo   Stock Room - Database Normalization
echo ========================================
echo.

echo Aggiunta colonna "link" alla tabella Product...
echo ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "link" TEXT; | docker exec -i stockroom-db psql -U stockroom -d stockroom
if %errorlevel% neq 0 (
    echo [ERRORE] Impossibile aggiungere la colonna. Assicurati che il container stockroom-db sia in esecuzione.
    pause
    exit /b 1
)

echo Registrazione migrazione in Prisma...
echo INSERT INTO "_prisma_migrations" (id, checksum, migration_name, finished_at, applied_steps_count) SELECT gen_random_uuid(), 'manual', '20260325120000_add_link_to_product', NOW(), 1 WHERE NOT EXISTS (SELECT 1 FROM "_prisma_migrations" WHERE migration_name = '20260325120000_add_link_to_product'); | docker exec -i stockroom-db psql -U stockroom -d stockroom
if %errorlevel% neq 0 (
    echo [ERRORE] Impossibile registrare la migrazione.
    pause
    exit /b 1
)

echo.
echo [OK] Migrazione completata con successo!
pause
