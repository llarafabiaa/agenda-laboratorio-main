const bloqueioModel = require("../models/bloqueioModel");

async function listar(req, res) {
  try { res.json(await bloqueioModel.listar({ data: req.query.data })); }
  catch (erro) { res.status(500).json({ erro: "Erro ao listar bloqueios", detalhe: erro.message }); }
}

async function buscar(req, res) {
  try {
    const bloqueio = await bloqueioModel.buscarPorId(req.params.id);
    if (!bloqueio) return res.status(404).json({ erro: "Bloqueio nao encontrado" });
    res.json(bloqueio);
  } catch (erro) { res.status(500).json({ erro: "Erro ao buscar bloqueio", detalhe: erro.message }); }
}

async function criar(req, res) {
  try {
    const { data, motivo } = req.body;
    if (!data || !motivo) return res.status(400).json({ erro: "Data e motivo sao obrigatorios" });
    res.status(201).json(await bloqueioModel.criar(req.body));
  } catch (erro) { res.status(500).json({ erro: "Erro ao criar bloqueio", detalhe: erro.message }); }
}

async function atualizar(req, res) {
  try {
    const atual = await bloqueioModel.buscarPorId(req.params.id);
    if (!atual) return res.status(404).json({ erro: "Bloqueio nao encontrado" });
    res.json(await bloqueioModel.atualizar(req.params.id, req.body));
  } catch (erro) { res.status(500).json({ erro: "Erro ao atualizar bloqueio", detalhe: erro.message }); }
}

async function remover(req, res) {
  try {
    await bloqueioModel.remover(req.params.id);
    res.status(204).send();
  } catch (erro) { res.status(500).json({ erro: "Erro ao remover bloqueio", detalhe: erro.message }); }
}

module.exports = { listar, buscar, criar, atualizar, remover };
