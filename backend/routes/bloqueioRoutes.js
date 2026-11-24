const express = require("express");
const controller = require("../controllers/bloqueioController");
const { autenticacao, exigirTipo } = require("../middlewares/autenticacao");

const router = express.Router();
router.use(autenticacao);
router.get("/", controller.listar);
router.get("/:id", controller.buscar);
router.post("/", exigirTipo("ADMIN"), controller.criar);
router.put("/:id", exigirTipo("ADMIN"), controller.atualizar);
router.delete("/:id", exigirTipo("ADMIN"), controller.remover);

module.exports = router;
