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
  res.send("API ativa");
});

// webhook da cakto
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-signature'] || req.headers['x-cakto-signature'];

  if (!signature) {
    return res.status(401).send('WEBHOOK BLOQUEADO: sem assinatura');
  }

  const expectedSignature = crypto
    .createHmac('sha256', '592fb8be-4673-429c-8278-f215af77b1f0')
    .update(req.rawBody)
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(401).send('WEBHOOK BLOQUEADO: assinatura inválida');
  }

  console.log('WEBHOOK AUTENTICADO');

  // processa purchase_approved aqui
  res.sendStatus(200);
});

app.listen(3000, () => {
  console.log("Servidor ativo na porta 3000");
});
