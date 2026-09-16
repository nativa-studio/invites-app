#!/usr/bin/env bash
# Recreate the local test database from the stub, the migrations and the seed. Local only.
set -euo pipefail
cd "$(dirname "$0")/../.."
su postgres -c "psql -q -c 'drop database if exists bunting_test' -c 'create database bunting_test'"
su postgres -c "psql -q -v ON_ERROR_STOP=1 -d bunting_test -c 'create extension if not exists pgcrypto' -f supabase/local/stub.sql $(ls supabase/migrations/*.sql | sed 's/^/-f /' | tr '\n' ' ') -f supabase/seed.sql"
echo "local database ready: postgres://postgres@localhost/bunting_test"
