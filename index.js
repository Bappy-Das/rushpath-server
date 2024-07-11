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


async function run() {
    try {
        // await client.connect();
        await client.connect((err) => {
            if (err) {
                console.error('Error connecting to MongoDB:', err);
                console.error('Error details:', err.codeName, err.code, err.codeName);
                console.error('Error labels:', Array.from(err[Symbol.for('errorLabels')]));

                process.exit(1);
            } else {
                app.listen(port, () => {
                    console.log(`🚀 App listening on port http://localhost:${port}`);
                });
            }
        });
        console.log("conncect in async")
        const database = client.db("resupath");
        // const orderCollection = database.collection("downloaders");
        const downloaderCollection = database.collection("downloaders");


        // check and update the downloader
        app.get('/create-update-downloader', async (req, res) => {
            try {
              const count = await downloaderCollection.countDocuments();
              if (count > 0) {
                const data = await downloaderCollection.find({}).toArray();
                const countdata=data[0].totalDownload;
                const result = await downloaderCollection.updateOne({}, { $set: { 'totalDownload': countdata + 1 } });
                res.json({ 
                    hasData: true, 
                    message: 'Collection has updata and count incremented', 
                });
              } else {
                const order = req.body;
                order.totalDownload = 1;
                const result = await downloaderCollection.insertOne(order)
                res.json({result,order})
              }
            } catch (err) {
              console.error('Error checking collection:', err);
              res.status(500).send('Internal Server Error');
            }
          });

        // get full count of downloads
          app.get('/total-downloader', async (req, res) => {
            const cursor = downloaderCollection.find({});
            const services = await cursor.toArray();
            res.json(services)
        })
    }
    finally {
        // await client.close();
    }

}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send("Server Connected")
});
app.listen(port, () => {
    console.log("Connected from", port)
})
