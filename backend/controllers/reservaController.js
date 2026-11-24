const crypto = require("crypto");
const reservaModel = require("../models/reservaModel");

async function listar(req, res) {
  try {
    const filtros = { data: req.query.data, status: req.query.status };
    res.json(await reservaModel.listar(filtros));
  } catch (erro) { res.status(500).json({ erro: "Erro ao listar reservas", detalhe: erro.message }); }
}

async function buscar(req, res) {
  try {
    const reserva = await reservaModel.buscarPorId(req.params.id);
    if (!reserva) return res.status(404).json({ erro: "Reserva nao encontrada" });
    res.json(reserva);
  } catch (erro) { res.status(500).json({ erro: "Erro ao buscar reserva", detalhe: erro.message }); }
}

async function criar(req, res) {
  try {
    const { data_reserva, turma_atividade, horario_id, horarios } = req.body;
    if (!data_reserva || !turma_atividade) {
      return res.status(400).json({ erro: "Data e turma/atividade sao obrigatorios" });
    }
    const ids = horarios?.length ? horarios : (horario_id ? [horario_id] : []);
    if (!ids.length) return res.status(400).json({ erro: "Informe pelo menos um periodo" });
    const grupo = ids.length > 1 ? crypto.randomUUID() : null;
    const reservas = [];
    for (const id of ids) {
      reservas.push(await reservaModel.criar({
        usuario_id: req.usuario.id,
        data_reserva,
        horario_id: id,
        turma_atividade,
        grupo_reserva: grupo
      }));
    }
    res.status(201).json(grupo ? reservas : reservas[0]);
  } catch (erro) {
    if (erro.code === "ER_DUP_ENTRY") return res.status(409).json({ erro: "Este periodo ja esta reservado nesta data" });
    if (erro.sqlState === "45000") return res.status(409).json({ erro: erro.sqlMessage });
    res.status(500).json({ erro: "Erro ao criar reserva", detalhe: erro.message });
  }
}

async function atualizar(req, res) {
  try {
    const atual = await reservaModel.buscarPorId(req.params.id);
    if (!atual) return res.status(404).json({ erro: "Reserva nao encontrada" });
    if (req.usuario.perfil !== "ADMIN" && atual.usuario_id !== req.usuario.id) {
      return res.status(403).json({ erro: "Voce nao pode alterar esta reserva" });
    }
    if (req.usuario.perfil !== "ADMIN" && req.body.status !== undefined) {
      return res.status(403).json({ erro: "Somente administradores podem alterar o status" });
    }
    res.json(await reservaModel.atualizar(req.params.id, req.body));
  } catch (erro) { res.status(500).json({ erro: "Erro ao atualizar reserva", detalhe: erro.message }); }
}

async function remover(req, res) {
  try {
    const reserva = await reservaModel.buscarPorId(req.params.id);
    if (!reserva) return res.status(404).json({ erro: "Reserva nao encontrada" });
    if (req.usuario.perfil !== "ADMIN" && reserva.usuario_id !== req.usuario.id) {
      return res.status(403).json({ erro: "Voce nao pode cancelar esta reserva" });
    }
    await reservaModel.atualizar(req.params.id, { status: "CANCELADA" });
    res.status(204).send();
  } catch (erro) { res.status(500).json({ erro: "Erro ao remover reserva", detalhe: erro.message }); }
}

async function horarios(req, res) {
  try { res.json(await reservaModel.listarHorarios()); }
  catch (erro) { res.status(500).json({ erro: "Erro ao listar horarios", detalhe: erro.message }); }
}

module.exports = { listar, buscar, criar, atualizar, remover, horarios };
