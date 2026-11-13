CREATE TABLE IF NOT EXISTS visitas (
  local_id TEXT PRIMARY KEY,
  dados TEXT NOT NULL,
  atualizado_em TEXT NOT NULL
);

-- Locais, fornecedores (buffet, brinquedos, serviços, aluguéis) e eventos.
CREATE TABLE IF NOT EXISTS registros (
  colecao TEXT NOT NULL,
  id TEXT NOT NULL,
  dados TEXT NOT NULL,
  atualizado_em TEXT NOT NULL,
  PRIMARY KEY (colecao, id)
);
