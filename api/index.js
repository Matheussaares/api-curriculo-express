const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.use(cors());
app.use(express.json());

// --- ROTA INICIAL (Mata o erro 404 da Vercel) ---
app.get('/', (req, res) => {
  res.json({ message: 'API do Currículo Express rodando com sucesso!' });
});

// --- ROTA EXCLUSIVA PARA O APP PORTFÓLIO ---
app.get('/api/meu-curriculo', (req, res) => {
  const portfolioData = {
    perfil: {
      nome: "Matheus Soares Lima",
      localizacao: "Recife, PE",
      resumo: "Profissional em transição para a área de tecnologia (desenvolvimento/suporte), com sólida experiência prévia em rotinas administrativas, faturamento e finanças.",
    },
    academico: [
      {
        curso: "Sistemas para Internet",
        instituicao: "UNICAP",
        status: "Em andamento"
      }
    ],
    experiencia_profissional: [
      {
        cargo: "Analista de Faturamento / Administrativo",
        periodo: "Até Março/2026",
        descricao: "Gestão de rotinas de faturamento, controle financeiro e processos administrativos. Foco atual 100% voltado para a transição de carreira para a área tech."
      }
    ],
    projetos_destaque: [
      {
        nome: "POUP",
        tecnologias: ["React", "JavaScript", "Front-end"],
        descricao: "Aplicativo web voltado para a gestão e organização financeira."
      },
      {
        nome: "Sistema para Estúdio de Tatuagem",
        tecnologias: ["Banco de Dados", "MER/DBML", "Requisitos"],
        descricao: "Modelagem de dados e levantamento de requisitos para automação da gestão de um estúdio de tatuagem e piercing."
      },
      {
        nome: "API Node.js CRUD",
        tecnologias: ["Node.js", "Express", "PostgreSQL"],
        descricao: "Desenvolvimento de uma API RESTful completa com integração a banco de dados relacional (NeonDB) e deploy na Vercel."
      }
    ]
  };

  res.json(portfolioData);
});

// --- ROTAS DE PESSOAS (CRUD Original) ---

// Listar todas as pessoas (GET)
app.get('/pessoas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pessoas');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Criar nova pessoa (POST)
app.post('/pessoas', async (req, res) => {
  const { nome, email, telefone, resumo } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO pessoas (nome, email, telefone, resumo) VALUES ($1, $2, $3, $4) RETURNING *',
      [nome, email, telefone, resumo]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Atualizar pessoa (PUT)
app.put('/pessoas/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, email, telefone, resumo } = req.body;
  try {
    const result = await pool.query(
      'UPDATE pessoas SET nome = $1, email = $2, telefone = $3, resumo = $4 WHERE id = $5 RETURNING *',
      [nome, email, telefone, resumo, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Deletar pessoa (DELETE)
app.delete('/pessoas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM pessoas WHERE id = $1', [id]);
    res.json({ message: 'Pessoa removida com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ROTAS DE EXPERIÊNCIAS (CRUD Original) ---

// Criar nova experiência (POST)
app.post('/experiencias', async (req, res) => {
  const { pessoa_id, empresa, cargo } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO experiencias (pessoa_id, empresa, cargo) VALUES ($1, $2, $3) RETURNING *',
      [pessoa_id, empresa, cargo]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar experiências de uma pessoa (GET)
app.get('/pessoas/:id/experiencias', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM experiencias WHERE pessoa_id = $1', [id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

module.exports = app;