require("dotenv").config();
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

const config = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "reservas_laboratorio",
  waitForConnections: true,
  connectionLimit: 10,
};

let pool;

async function iniciarBanco() {
  pool = mysql.createPool(config);
  await pool.query("SELECT 1");

  const email = (process.env.ADMIN_MASTER_EMAIL || "admin@reservas.lab").toLowerCase();
  const senha = process.env.ADMIN_MASTER_PASSWORD || "Admin@123";
  const [usuarios] = await pool.execute(
    "SELECT id FROM usuarios WHERE email = ? LIMIT 1",
    [email]
  );
  if (!usuarios.length) {
    const senhaHash = await bcrypt.hash(senha, 10);
    await pool.execute(
      "INSERT INTO usuarios (nome, email, senha, perfil, ativo) VALUES (?, ?, ?, 'ADMIN', TRUE)",
      ["Administrador Mestre", email, senhaHash]
    );
  }

  return pool;
}

function getPool() {
  if (!pool) throw new Error("Banco de dados ainda nao foi iniciado");
  return pool;
}

module.exports = { iniciarBanco, getPool };