require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
  host: "localhost",
  user: "root", // Mude para seu usuário do MySQL
  password: "", // Mude para sua senha do MySQL
  database: "espaco_beleza",
});

db.connect((err) => {
  if (err) {
    console.error("Erro ao conectar no MySQL:", err);
    return;
  }
  console.log("Conectado ao banco de dados!");
});

// Gerar Token JWT
const gerarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// **Cadastro de Usuário**
app.post("/cadastro", async (req, res) => {
  const { nome_completo, nome_negocio, cpf_cnpj, email, senha, telefone, cep, numero, complemento, tipo_acesso } = req.body;

  // Hash da senha
  const senhaHash = await bcrypt.hash(senha, 10);

  const sql = "INSERT INTO usuario (nome_completo, nome_negocio, cpf_cnpj, email, senha, telefone, cep, numero, complemento, tipo_acesso) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  db.query(sql, [nome_completo, nome_negocio, cpf_cnpj, email, senhaHash, telefone, cep, numero, complemento, tipo_acesso], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: "Usuário cadastrado com sucesso!" });
  });
});

// **Login de Usuário**
app.post("/login", (req, res) => {
  const { email, senha } = req.body;
  const sql = "SELECT * FROM usuario WHERE email = ?";

  db.query(sql, [email], async (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(401).json({ error: "Usuário não encontrado!" });

    const usuario = result[0];
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) return res.status(401).json({ error: "Senha incorreta!" });

    const token = gerarToken(usuario.id);
    res.json({ token, usuario });
  });
});

// **Cadastro de Serviços pelo Prestador**
app.post("/servicos", (req, res) => {
  const { servico, valor, descricao, usuario_id } = req.body;
  const sql = "INSERT INTO servicos (servico, valor, descricao, usuario_id) VALUES (?, ?, ?, ?)";
  db.query(sql, [servico, valor, descricao, usuario_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: "Serviço cadastrado com sucesso!" });
  });
});

// **Cadastro de Horários Disponíveis na Agenda do Prestador**
app.post("/agenda", (req, res) => {
  const { usuario_id, data, hora } = req.body;
  const sql = "INSERT INTO agendamentos (usuario_id, data, hora) VALUES (?, ?, ?)";
  db.query(sql, [usuario_id, data, hora], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: "Horário adicionado à agenda!" });
  });
});

// **Agendamento de Serviço pelo Cliente**
app.post("/agendar", (req, res) => {
  const { usuario_id, servicos_id, data, hora } = req.body;
  const sql = "INSERT INTO agendamentos (usuario_id, servicos_id, data, hora) VALUES (?, ?, ?, ?)";
  db.query(sql, [usuario_id, servicos_id, data, hora], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: "Agendamento realizado com sucesso!" });
  });
});

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
