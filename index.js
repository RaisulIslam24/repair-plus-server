const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
const bodeParser = require('body-parser');
require('dotenv').config()

const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3fo4t.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

app.use(express.json());
app.use(cors());
app.use(bodeParser.json());

app.get('/', (req, res) => {
    res.send("Hello from db it's working")
})


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const servicesCollection = client.db("repairPlus").collection("services");
    const ordersCollection = client.db("repairPlus").collection("orders");
    const adminsCollection = client.db("repairPlus").collection("admins");
    const reviewsCollection = client.db("repairPlus").collection("reviews");

    app.get('/ordersByEmail', (req, res) => {
        ordersCollection.find({ email: req.query.email })
            .toArray((err, items) => {
                res.send(items)
            })
    })

    app.get('/orders', (req, res) => {
        ordersCollection.find({})
            .toArray((err, items) => {
                res.send(items)
            })
    })

    app.post('/addService', (req, res) => {
        const service = req.body;
        servicesCollection.insertOne(service)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    });

    app.get('/services', (req, res) => {
        servicesCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.post('/addAReview', (req, res) => {
        const name = req.body.name;
        const description = req.body.description;
        reviewsCollection.insertOne({ name, description })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    app.get('/reviews', (req, res) => {
        reviewsCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })


    app.post('/addAnAdmin', (req, res) => {
        const email = req.body.email;
        adminsCollection.insertOne({ email })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    app.get('/service/:id', (req, res) => {
        servicesCollection.find({ _id: ObjectId(req.params.id) })
            .toArray((err, items) => {
                res.send(items[0])
            })
    })

    app.post('/addOrder', (req, res) => {
        const order = req.body;
        ordersCollection.insertOne(order)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        adminsCollection.find({ email: email })
            .toArray((er, doctors) => {
                res.send(doctors.length > 0);
            })
    })

    app.delete('/deleteService/:id', (req, res) => {
        const id = ObjectId(req.params.id);
        servicesCollection.findOneAndDelete({_id: id})
        .then(documents => res.send(!!documents.value))
      })

});


app.listen(process.env.PORT || port)