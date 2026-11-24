require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const { iniciarBanco } = require("./config/database");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", (req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

app.use("/api/usuarios", require("./routes/usuarioRoutes"));
app.use("/api/reservas", require("./routes/reservaRoutes"));
app.use("/api/bloqueios", require("./routes/bloqueioRoutes"));

const pastaFrontend = path.join(__dirname, "..", "frontend");
app.use(express.static(pastaFrontend));
app.get("/", (req, res) => {
  res.sendFile(path.join(pastaFrontend, "index.html"));
});

app.use((req, res) => res.status(404).json({ erro: "Rota nao encontrada" }));
app.use((erro, req, res, next) => {
  console.error(erro);
  res.status(500).json({ erro: "Erro interno do servidor" });
});

const porta = process.env.PORT || 3000;
iniciarBanco()
  .then(() => {
    app.listen(porta, () => {
      console.log(`Servidor rodando em http://localhost:${porta}`);
    });
  })
  .catch((erro) => {
    console.error("Nao foi possivel iniciar o banco de dados:", erro.message);
    process.exit(1);
  });