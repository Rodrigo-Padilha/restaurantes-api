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
app.post('/webhook', express.json(), (req, res) => {
  console.log('HEADERS RECEBIDOS:', req.headers);
  console.log('BODY RECEBIDO:', req.body);

  res.sendStatus(200);
});

app.listen(3000, () => {
  console.log("Servidor ativo na porta 3000");
});
