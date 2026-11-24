const express = require("express");
const controller = require("../controllers/reservaController");
const { autenticacao } = require("../middlewares/autenticacao");

const router = express.Router();
router.use(autenticacao);
router.get("/horarios", controller.horarios);
router.get("/", controller.listar);
router.get("/:id", controller.buscar);
router.post("/", controller.criar);
router.put("/:id", controller.atualizar);
router.delete("/:id", controller.remover);

module.exports = router;
