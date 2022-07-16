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
  client.connect(async () => {
    try {
      const collection = client.db(DB_NAME).collection(USERS_COLLECTION);
      const { email, age } = req.body;
      const first_name = req.body.first_name.charAt(0).toUpperCase() + req.body.first_name.slice(1);
      const last_name = req.body.last_name.charAt(0).toUpperCase() + req.body.last_name.slice(1);
      const filter = await collection.find({ email }).toArray();
      if (filter.length > 0) {
        res.send([{ acknowledged: false }, 'Toks vartotojas jau yra sukurtas']);
        client.close();
      } else {
        const result = await collection.insertOne({
          first_name,
          last_name,
          email,
          age: Number(age),
        });
        client.close();
        res.json(result);
      }
    } catch (error) {
      res.send('Something went wrong!!');
      client.close();
    }
  });
});

app.delete('/users/:id', (req, res) => {
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
  client.connect(async (err) => {
    if (err) {
      res.send([{ acknowledged: false }, 'Something went wrong with DB connection!!!']);
      client.close();
    } else {
      const collection = client.db(DB_NAME).collection(USERS_COLLECTION);
      const { _id, email, age } = req.body;
      const first_name = req.body.first_name.charAt(0).toUpperCase() + req.body.first_name.slice(1);
      const last_name = req.body.last_name.charAt(0).toUpperCase() + req.body.last_name.slice(1);

      const filter = { _id: ObjectId(_id) };
      const newValues = {
        first_name,
        last_name,
        email,
        age: Number(age),
      };
      try {
        const result = await collection.replaceOne(filter, newValues);
        res.send([result, 'Vartotojas pakoreguotas']);
        client.close();
      } catch (error) {
        res.send('Something went wrong!!');
        client.close();
      }
    }
  });
});
