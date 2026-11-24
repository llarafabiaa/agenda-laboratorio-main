const { getPool } = require("../config/database");

async function criar({ nome, email, senha, perfil = "PROFESSOR" }) {
  const [resultado] = await getPool().execute(
    "INSERT INTO usuarios (nome, email, senha, perfil) VALUES (?, ?, ?, ?)",
    [nome, email, senha, perfil]
  );
  return buscarPorId(resultado.insertId);
}

async function buscarPorEmail(email) {
  const [linhas] = await getPool().execute(
    "SELECT * FROM usuarios WHERE email = ? LIMIT 1",
    [email]
  );
  return linhas[0] || null;
}

async function buscarPorId(id) {
  const [linhas] = await getPool().execute(
    "SELECT id, nome, email, perfil, ativo, criado_em, atualizado_em FROM usuarios WHERE id = ?",
    [id]
  );
  return linhas[0] || null;
}

async function listar() {
  const [linhas] = await getPool().query(
    "SELECT id, nome, email, perfil, ativo, criado_em, atualizado_em FROM usuarios ORDER BY nome"
  );
  return linhas;
}

async function atualizar(id, dados) {
  const campos = [];
  const valores = [];
  for (const chave of ["nome", "email", "perfil", "ativo"]) {
    if (dados[chave] !== undefined) {
      campos.push(`${chave} = ?`);
      valores.push(dados[chave]);
    }
  }
  if (!campos.length) return buscarPorId(id);
  valores.push(id);
  await getPool().execute(`UPDATE usuarios SET ${campos.join(", ")} WHERE id = ?`, valores);
  return buscarPorId(id);
}

async function remover(id) {
  await getPool().execute("DELETE FROM usuarios WHERE id = ?", [id]);
  return true;
}

module.exports = { criar, buscarPorEmail, buscarPorId, listar, atualizar, remover };
