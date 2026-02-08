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

// middleware de segurança do webhook
function validarWebhook(req, res, next) {
  const signature = req.headers["x-webhook-signature"];

  if (!signature) {
    return res.status(401).send("Webhook sem assinatura");
  }

  const hash = crypto
    .createHmac("sha256", process.env.WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (hash !== signature) {
    return res.status(403).send("Assinatura inválida");
  }

  next();
}

// webhook da cakto
app.post("/cakto-webhook", async (req, res) => {
  try {

    const signature =
      req.headers["x-webhook-secret"] ||
      req.headers["webhook-secret"] ||
      req.headers["authorization"] ||
      req.headers["x-cakto-signature"];

    if (!signature) {
      console.log("webhook sem assinatura");
      return res.status(401).send("sem assinatura");
    }

    if (signature !== process.env.WEBHOOK_SECRET) {
      console.log("assinatura inválida");
      return res.status(403).send("assinatura inválida");
    }

    const payload = req.body;

    console.log("WEBHOOK RECEBIDO");

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
