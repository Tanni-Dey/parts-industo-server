const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken')
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(express.json())
app.use(cors())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.stdsb.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect();
        const toolsCollection = client.db("partsIndusto").collection("tools");
        const ordersCollection = client.db("partsIndusto").collection("orders");
        const reviewsCollection = client.db("partsIndusto").collection("reviews");

        //load tools api
        app.get('/tool', async (req, res) => {
            const query = {}
            const allTools = await toolsCollection.find(query).toArray()
            res.send(allTools)
        })

        //load all reviews api
        app.get('/review', async (req, res) => {
            const query = {}
            const allReviews = await reviewsCollection.find(query).toArray()
            res.send(allReviews)
        })

        //load signle tool api
        app.get('/tool/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const singleTool = await toolsCollection.findOne(query)
            res.send(singleTool)
        })

        //post order api
        app.post('/order', async (req, res) => {
            const query = req.body;
            const order = await ordersCollection.insertOne(query)
            res.send(order)
        })

        //post review api
        app.post('/review', async (req, res) => {
            const query = req.body;
            const review = await reviewsCollection.insertOne(query)
            res.send(review)
        })

        //get my orders api with email query
        app.get('/myorder', async (req, res) => {
            const userEmail = req.query.email;
            const query = { email: userEmail }
            const userOrders = await ordersCollection.find(query).toArray()
            res.send(userOrders)
        })


    }
    finally {

    }

}
run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('parts-industo')
})
app.listen(port, () => {
    console.log('parts-industo', port);
})