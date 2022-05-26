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

function verifyJwt(req, res, next) {
    const autheader = req.headers.authorization;
    if (!autheader) {
        return res.status(401).send({ message: 'Unauthorized Access' })
    }
    const token = autheader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbiden Access' })
        }
        req.decoded = decoded
        next()

    })

}
async function run() {
    try {
        await client.connect();
        const toolsCollection = client.db("partsIndusto").collection("tools");
        const ordersCollection = client.db("partsIndusto").collection("orders");
        const reviewsCollection = client.db("partsIndusto").collection("reviews");
        const usersCollection = client.db("partsIndusto").collection("users");

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


        //load all users api
        app.get('/user', verifyJwt, async (req, res) => {
            const query = {}
            const allUsers = await usersCollection.find(query).toArray()
            res.send(allUsers)
        })


        //update or insert all user api
        app.put('/user/:email', async (req, res) => {
            const userEmail = req.params.email;
            const user = req.body;
            const filter = { email: userEmail }
            const options = { upsert: true };
            const udateUser = {
                $set: user
            }
            const result = await usersCollection.updateOne(filter, udateUser, options)
            const token = jwt.sign({ email: userEmail }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
            res.send({ result, token })
        })

        //admin check
        app.get('/admin/:email', verifyJwt, async (req, res) => {
            const email = req.params.email;
            const user = await usersCollection.findOne({ email: email })
            const isAdmin = user.role === 'admin';
            res.send({ admin: isAdmin })
        })

        //make admin api
        app.put('/user/admin/:email', verifyJwt, async (req, res) => {
            const userEmail = req.params.email;
            // const user = req.body;
            const filter = { email: userEmail }
            const decodedEmail = req.decoded.email
            const user = await usersCollection.findOne({ email: decodedEmail })
            if (user.role === 'admin') {
                const udateUser = {
                    $set: { role: 'admin' }
                }
                const result = await usersCollection.updateOne(filter, udateUser)
                res.send(result)
            }
            else {
                return res.status(403).send({ message: 'Forbiden Access' })

            }
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
        app.get('/myorder', verifyJwt, async (req, res) => {
            const userEmail = req.query.email;
            const requester = req.decoded?.email;
            const query = { email: userEmail }
            if (userEmail === requester) {
                const userOrders = await ordersCollection.find(query).toArray()
                return res.send(userOrders)
            }
            else {
                return res.status(403).send({ message: 'Forbiden access' })
            }

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