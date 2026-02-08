const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");

const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
app.use(bodyParser.json());

// rota teste
app.get("/", (req, res) => {
  res.send("API Restaurantes ativa 🚀");
});

// webhook da cakto
app.post("/cakto-webhook", async (req, res) => {
  try {

    // valida chave secreta enviada pela Cakto
    const secretRecebido =
      req.headers["x-webhook-secret"] ||
      req.headers["webhook-secret"] ||
      req.headers["authorization"];

    if (!secretRecebido) {
      console.log("WEBHOOK BLOQUEADO: sem chave");
      return res.status(401).send("sem chave");
    }

    if (secretRecebido !== process.env.WEBHOOK_SECRET) {
      console.log("WEBHOOK BLOQUEADO: chave inválida");
      return res.status(403).send("chave inválida");
    }

    console.log("WEBHOOK AUTORIZADO");

    const payload = req.body;

    if (!payload || !payload.data || !payload.data.customer) {
      console.log("payload fora do padrão");
      return res.status(400).send("payload inválido");
    }

    const email = payload.data.customer.email;
    const senha = payload.data.customer.docNumber;
    const nome = payload.data.customer.name;

    const user = await admin.auth().createUser({
      email: email,
      password: senha,
      displayName: nome
    });

    console.log("USUÁRIO CRIADO:", user.uid);

    res.status(200).json({ success: true });

  } catch (err) {
    console.error("ERRO:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log("Servidor ativo na porta 3000");
});
