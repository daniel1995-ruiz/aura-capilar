#!/usr/bin/env bash
# Regenera prisma/schema.production.prisma a partir de prisma/schema.prisma
# cada vez que cambies el modelo de datos. Solo difiere el datasource (postgresql vs sqlite).
set -euo pipefail
cd "$(dirname "$0")/.."
sed \
  -e 's/provider = "sqlite"/provider = "postgresql"/' \
  -e 's#// AURA CAPILAR — modelo de datos#// AURA CAPILAR — modelo de datos (PRODUCCIÓN: PostgreSQL)#' \
  -e 's#// Local: SQLite.*#// Generado a partir de schema.prisma. No editar a mano: correr scripts/sync-prod-schema.sh#' \
  prisma/schema.prisma > prisma/schema.production.prisma
echo "prisma/schema.production.prisma actualizado."
