const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const usuarioModel = require("../models/usuarioModel");

async function cadastrar(req, res) {
  try {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) return res.status(400).json({ erro: "Nome, email e senha sao obrigatorios" });
    if (await usuarioModel.buscarPorEmail(email.toLowerCase())) {
      return res.status(409).json({ erro: "Este email ja esta cadastrado" });
    }
    const senhaHash = await bcrypt.hash(senha, 10);
    const usuario = await usuarioModel.criar({
      nome, email: email.toLowerCase(), senha: senhaHash, perfil: "PROFESSOR"
    });
    res.status(201).json(usuario);
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao cadastrar usuario", detalhe: erro.message });
  }
}

async function login(req, res) {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ erro: "Email e senha sao obrigatorios" });
    const usuario = await usuarioModel.buscarPorEmail(email.toLowerCase());
    if (!usuario || !usuario.ativo || !(await bcrypt.compare(senha, usuario.senha))) {
      return res.status(401).json({ erro: "Email ou senha invalidos" });
    }
    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome, perfil: usuario.perfil },
      process.env.JWT_SECRET || "troque-esta-chave",
      { expiresIn: "8h" }
    );
    res.json({
      token,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil }
    });
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao realizar login", detalhe: erro.message });
  }
}

async function listar(req, res) {
  try { res.json(await usuarioModel.listar()); }
  catch (erro) { res.status(500).json({ erro: "Erro ao listar usuarios", detalhe: erro.message }); }
}

async function buscar(req, res) {
  try {
    const usuario = await usuarioModel.buscarPorId(req.params.id);
    if (!usuario) return res.status(404).json({ erro: "Usuario nao encontrado" });
    res.json(usuario);
  } catch (erro) { res.status(500).json({ erro: "Erro ao buscar usuario", detalhe: erro.message }); }
}

async function atualizar(req, res) {
  try {
    if (req.params.id != req.usuario.id && req.usuario.perfil !== "ADMIN") {
      return res.status(403).json({ erro: "Voce nao pode alterar este usuario" });
    }
    const usuario = await usuarioModel.atualizar(req.params.id, req.body);
    if (!usuario) return res.status(404).json({ erro: "Usuario nao encontrado" });
    res.json(usuario);
  } catch (erro) { res.status(500).json({ erro: "Erro ao atualizar usuario", detalhe: erro.message }); }
}

async function remover(req, res) {
  try {
    await usuarioModel.remover(req.params.id);
    res.status(204).send();
  } catch (erro) { res.status(500).json({ erro: "Erro ao remover usuario", detalhe: erro.message }); }
}

async function perfil(req, res) {
  try {
    const usuario = await usuarioModel.buscarPorId(req.usuario.id);
    if (!usuario) return res.status(404).json({ erro: "Usuario nao encontrado" });
    res.json(usuario);
  } catch (erro) { res.status(500).json({ erro: "Erro ao buscar perfil", detalhe: erro.message }); }
}

module.exports = { cadastrar, login, listar, buscar, atualizar, remover, perfil };
