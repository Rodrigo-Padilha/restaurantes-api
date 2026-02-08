const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const crypto = require("crypto");

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

    // tenta capturar a assinatura em vários headers possíveis
    const signature =
      req.headers["x-webhook-secret"] ||
      req.headers["webhook-secret"] ||
      req.headers["authorization"] ||
      req.headers["x-cakto-signature"];

    if (!signature) {
      console.log("WEBHOOK SEM ASSINATURA");
      return res.status(401).send("Webhook sem assinatura");
    }

    // valida comparando com o secret do .env
    if (signature !== process.env.WEBHOOK_SECRET) {
      console.log("ASSINATURA INVÁLIDA");
      return res.status(403).send("Assinatura inválida");
    }

    const payload = req.body;

    console.log("WEBHOOK RECEBIDO:");
    console.log(JSON.stringify(payload, null, 2));

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
