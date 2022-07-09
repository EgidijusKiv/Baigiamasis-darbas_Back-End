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
  ObjectId,
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
  console.log(req.body);
  client.connect(async () => {
    const collection = client.db(DB_NAME).collection(USERS_COLLECTION);
    const {
      first_name, last_name, email, age,
    } = req.body;
    const result = await collection.insertOne({
      first_name,
      last_name,
      email,
      age: Number(age),
    });
    client.close();

    res.json(result);
  });
});

app.delete('/users/:id', (req, res) => {
  console.log(req.params);
  client.connect(async () => {
    const collection = client.db(DB_NAME).collection(USERS_COLLECTION);
    const result = await collection.deleteOne({
      _id: ObjectId(req.params.id),
    });
    client.close();

    res.json(result);
  });
});

app.put('/users', (req, res) => {
  client.connect(async (err, clientDb) => {
    if (err) {
      res.send('Something went wrong!!');
      clientDb.close();
    } else {
      const collection = client.db(DB_NAME).collection(USERS_COLLECTION);
      const {
        _id, first_name, last_name, email, age,
      } = req.body;
      const filter = { _id: ObjectId(_id) };
      const newValues = {
        first_name, last_name, email, age,
      };
      try {
        const result = await collection.replaceOne(filter, newValues);
        res.send(result);
        clientDb.close();
      } catch (error) {
        res.send('Something went wrong!!');
        clientDb.close();
      }
    }
  });
});
