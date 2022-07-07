require('dotenv').config();

const {
  PORT,
  DB_URI,
  DB_NAME,
  USERS_COLLECTION,
} = process.env;

const {
  MongoClient,
  ServerApiVersion,
} = require('mongodb');

const client = new MongoClient(DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const express = require('express');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
// //////////////////////////////////////////////////////

app.get('/users', (req, res) => {
  client.connect(async () => {
    const collection = client.db(DB_NAME).collection(USERS_COLLECTION);
    const result = await collection.find({}).toArray();

    client.close();
    res.json(result);
  });
});

app.post('/users', (req, res) => {
  const newUser = req.body;
  client.connect(async () => {
    const collection = client.db(DB_NAME).collection(USERS_COLLECTION);
    const result = await collection.insertOne({ ...newUser });
    res.json(result);
    client.close();
  });
});
