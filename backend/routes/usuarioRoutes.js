const express = require("express");
const controller = require("../controllers/usuarioController");
const { autenticacao, exigirTipo } = require("../middlewares/autenticacao");

const router = express.Router();
router.post("/cadastro", controller.cadastrar);
router.post("/login", controller.login);
router.get("/perfil", autenticacao, controller.perfil);
router.get("/", autenticacao, exigirTipo("ADMIN"), controller.listar);
router.get("/:id", autenticacao, exigirTipo("ADMIN"), controller.buscar);
router.put("/:id", autenticacao, controller.atualizar);
router.delete("/:id", autenticacao, exigirTipo("ADMIN"), controller.remover);

module.exports = router;
