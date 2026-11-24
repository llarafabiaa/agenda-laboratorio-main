const jwt = require("jsonwebtoken");

function autenticacao(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ erro: "Token de acesso obrigatorio" });
  }

  try {
    req.usuario = jwt.verify(header.slice(7), process.env.JWT_SECRET || "troque-esta-chave");
    next();
  } catch {
    res.status(401).json({ erro: "Token invalido ou expirado" });
  }
}

function exigirTipo(...tipos) {
  return (req, res, next) => {
    if (!req.usuario || !tipos.includes(req.usuario.perfil)) {
      return res.status(403).json({ erro: "Voce nao tem permissao para esta operacao" });
    }
    next();
  };
}

module.exports = { autenticacao, exigirTipo };
