const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId
require('dotenv').config()
var cors = require('cors');
const app = express();

const port = process.env.PORT || 9900;
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dl2nf.mongodb.net/`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })

let dbConnection;

async function connectToDatabase() {
    if (dbConnection) return dbConnection;
    try {
        await client.connect();
        dbConnection = client.db('resupath');
        console.log("Connected to MongoDB");
        // console.log(`🚀 App listening on port http://localhost:${port}`);
        return dbConnection;
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    }
}

app.post('/create-update-downloader', async (req, res) => {
  try {
    const database = await connectToDatabase();
  const downloaderCollection = database.collection('downloaders');
      const count = await downloaderCollection.countDocuments();
      if (count > 0) {
          const data = await downloaderCollection.find({}).toArray();
          const countData = data[0].totalDownload;
          const result = await downloaderCollection.updateOne({}, { $set: { 'totalDownload': countData + 1 } });
          res.json({ 
              hasData: true, 
              message: 'Collection updated and count incremented', 
              result
          });
      } else {
          const order = req.body;
          order.totalDownload = 1;
          const result = await downloaderCollection.insertOne(order);
          res.json({ 
              hasData: false, 
              message: 'New record created', 
              result 
          });
      }
  } catch (err) {
      console.error('Error checking collection:', err);
      res.status(500).send('Internal Server Error');
  }
});

// get full count of downloads
app.get('/total-downloader', async (req, res) => {
    const database = await connectToDatabase();
    const downloaderCollection = database.collection('downloaders');
    const cursor = downloaderCollection.find({});
    const services = await cursor.toArray();
    res.json(services)
})

app.get('/', (req, res) => {
    res.send("Server Connected")
});
app.listen(port, () => {
  console.log("Connected from", port)
  console.log(`🚀 App listening on port http://localhost:${port}`);
})
