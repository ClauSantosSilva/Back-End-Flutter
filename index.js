const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");

const app = express();
app.use(cors());
app.use(express.json());

// Conexão com o banco de dados
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "espaco_beleza",
});

db.connect((err) => {
  if (err) {
    console.error("Erro ao conectar ao MySQL:", err);
    return;
  }
  console.log("Conectado ao MySQL com sucesso!");
});

// Cadastro de usuário
app.post("/usuario/cadastrar", async (req, res) => {
  const {
    nome,
    nome_negocio,
    cpf_cnpj,
    email,
    senha,
    telefone,
    cep,
    numero,
    complemento,
    tipo_acesso,
  } = req.body;

  try {
    const [existingUser] = await db.promise().query(
      "SELECT email FROM usuario WHERE email = ?", [email]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({ erro: "Este e-mail já está cadastrado." });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    const sql = `
      INSERT INTO usuario
      (nome, nome_negocio, cpf_cnpj, email, senha, telefone, cep, numero, complemento, tipo_acesso)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.promise().query(sql, [
      nome,
      nome_negocio,
      cpf_cnpj,
      email,
      hashedPassword,
      telefone,
      cep,
      numero,
      complemento,
      tipo_acesso,
    ]);

    res.status(201).json({ mensagem: "Usuário cadastrado com sucesso!", insertId: result.insertId });
  } catch (err) {
    console.error("Erro ao cadastrar:", err);
    res.status(500).json({ erro: "Erro interno ao cadastrar usuário." });
  }
});

// Login de usuário
app.post("/usuario/login", async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: "E-mail e senha são obrigatórios." });
  }

  try {
    const [rows] = await db.promise().query(
      "SELECT id, nome, email, senha FROM usuario WHERE email = ?", [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ erro: "Credenciais inválidas." });
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(senha, user.senha);

    if (passwordMatch) {
      res.status(200).json({
        mensagem: "Login realizado com sucesso!",
        id: user.id,
        nome: user.nome,
        email: user.email,
      });
    } else {
      res.status(401).json({ erro: "Credenciais inválidas." });
    }
  } catch (err) {
    console.error("Erro ao fazer login:", err);
    res.status(500).json({ erro: "Erro interno no login." });
  }
});

// Iniciar servidor
app.listen(3000, () => {
  console.log("Servidor backend rodando na porta 3000");
});
