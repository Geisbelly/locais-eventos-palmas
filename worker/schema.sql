CREATE TABLE IF NOT EXISTS visitas (
  local_id TEXT PRIMARY KEY,
  dados TEXT NOT NULL,
  atualizado_em TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS locais (
  id TEXT PRIMARY KEY,
  dados TEXT NOT NULL,
  atualizado_em TEXT NOT NULL
);
