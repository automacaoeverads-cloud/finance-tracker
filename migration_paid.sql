-- Adiciona coluna paid na tabela transactions
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS paid boolean DEFAULT false;
