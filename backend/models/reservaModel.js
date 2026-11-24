const { getPool } = require("../config/database");

async function criar(dados) {
  const [resultado] = await getPool().execute(
    `INSERT INTO reservas
     (usuario_id, data_reserva, horario_id, turma_atividade, grupo_reserva)
     VALUES (?, ?, ?, ?, ?)`,
    [dados.usuario_id, dados.data_reserva, dados.horario_id,
     dados.turma_atividade, dados.grupo_reserva || null]
  );
  return buscarPorId(resultado.insertId);
}

async function buscarPorId(id) {
  const [linhas] = await getPool().execute(
    `SELECT r.*, u.nome AS usuario_nome, u.email AS usuario_email,
            h.numero_periodo, h.horario_inicio, h.horario_fim
     FROM reservas r
     JOIN usuarios u ON u.id = r.usuario_id
     JOIN horarios h ON h.id = r.horario_id
     WHERE r.id = ?`,
    [id]
  );
  return linhas[0] || null;
}

async function listar({ usuario_id, data, status } = {}) {
  const filtros = [];
  const valores = [];
  if (usuario_id) { filtros.push("r.usuario_id = ?"); valores.push(usuario_id); }
  if (data) { filtros.push("r.data_reserva = ?"); valores.push(data); }
  if (status) { filtros.push("r.status = ?"); valores.push(status); }
  const where = filtros.length ? `WHERE ${filtros.join(" AND ")}` : "";
  const [linhas] = await getPool().execute(
    `SELECT r.*, u.nome AS usuario_nome, u.email AS usuario_email,
            h.numero_periodo, h.horario_inicio, h.horario_fim
     FROM reservas r
     JOIN usuarios u ON u.id = r.usuario_id
     JOIN horarios h ON h.id = r.horario_id
     ${where} ORDER BY r.data_reserva, h.numero_periodo`,
    valores
  );
  return linhas;
}

async function atualizar(id, dados) {
  const campos = [];
  const valores = [];
  for (const chave of ["data_reserva", "horario_id", "turma_atividade", "grupo_reserva", "status"]) {
    if (dados[chave] !== undefined) { campos.push(`${chave} = ?`); valores.push(dados[chave]); }
  }
  if (!campos.length) return buscarPorId(id);
  valores.push(id);
  await getPool().execute(`UPDATE reservas SET ${campos.join(", ")} WHERE id = ?`, valores);
  return buscarPorId(id);
}

async function remover(id) {
  await getPool().execute("DELETE FROM reservas WHERE id = ?", [id]);
  return true;
}

async function listarHorarios() {
  const [linhas] = await getPool().query(
    "SELECT id, numero_periodo, horario_inicio, horario_fim FROM horarios ORDER BY numero_periodo"
  );
  return linhas;
}

module.exports = { criar, buscarPorId, listar, atualizar, remover, listarHorarios };
