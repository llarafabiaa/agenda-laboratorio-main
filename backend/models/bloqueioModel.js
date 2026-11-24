const { getPool } = require("../config/database");

async function criar(dados) {
  const [resultado] = await getPool().execute(
    `INSERT INTO datas_bloqueadas (data, motivo) VALUES (?, ?)`,
    [dados.data, dados.motivo]
  );
  return buscarPorId(resultado.insertId);
}

async function listar({ data } = {}) {
  const filtros = [];
  const valores = [];
  if (data) { filtros.push("data = ?"); valores.push(data); }
  const where = filtros.length ? `WHERE ${filtros.join(" AND ")}` : "";
  const [linhas] = await getPool().execute(
    `SELECT * FROM datas_bloqueadas ${where} ORDER BY data`,
    valores
  );
  return linhas;
}

async function buscarPorId(id) {
  const [linhas] = await getPool().execute("SELECT * FROM datas_bloqueadas WHERE id = ?", [id]);
  return linhas[0] || null;
}

async function atualizar(id, dados) {
  const campos = [];
  const valores = [];
  for (const chave of ["data", "motivo"]) {
    if (dados[chave] !== undefined) { campos.push(`${chave} = ?`); valores.push(dados[chave]); }
  }
  if (!campos.length) return buscarPorId(id);
  valores.push(id);
  await getPool().execute(`UPDATE datas_bloqueadas SET ${campos.join(", ")} WHERE id = ?`, valores);
  return buscarPorId(id);
}

async function remover(id) {
  await getPool().execute("DELETE FROM datas_bloqueadas WHERE id = ?", [id]);
  return true;
}

module.exports = { criar, listar, buscarPorId, atualizar, remover };
