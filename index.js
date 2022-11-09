const { MongoClient } = require("mongodb");
const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;


const PORT = process.env.PORT || 5000;

// MIDDLEWARE
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running");
});
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@project.wytfk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const run = async () => {
  try {
    await client.connect();
    const database = client.db("PickyPro");
    const userCollections = database.collection("Users");
    const serviceCollections = database.collection('Services')
    const reviewCollections = database.collection('Reviews')

    //   create new user
    app.post("/api/user/create", async (req, res) => {
      const userData = req.body;
      const createdUser = await userCollections.insertOne(userData);
      res.json(createdUser);
    });

    // create an user google user
    app.put("/api/user/create", async (req, res) => {
        const user = req.body;
        const filter = { email: user.email };
        const options = { upsert: true };
        const updateDoc = { $set: user };
        const result = await userCollections.updateOne(
          filter,
          updateDoc,
          options
        );
        res.json(result);
      });

    // service api
    app.post('/api/service/create',async(req,res)=>{
        const serviceData = req.body
        const createdService = await  serviceCollections.insertOne(serviceData)
        res.json(createdService)
    })

    app.get('/api/services',async(req,res)=>{
        const cursor = serviceCollections.find({})
        const services = await cursor.toArray()
        res.json(services)
    })
    app.get('/api/services/limit',async(req,res)=>{
        const cursor = serviceCollections.find({})
        const services = await cursor.limit(3).toArray()
        res.json(services)
    })
    // get single service
    app.get('/api/service/:serviceId',async(req,res)=>{
        const id = req.params.serviceId
        const service =await serviceCollections.findOne({_id: ObjectId(id)})
        res.json(service)
    })

    // review api

    app.post('/api/review/create',async(req,res)=>{
        const reviewData = req.body
        const createdReview = await reviewCollections.insertOne(reviewData)
        res.json(createdReview)
    })

    // get single service review
    app.get('/api/reviews/:serviceId',(req,res)=>{
        const cursor
    })

    
  } finally {
    // await client.close()
  }
};
run().catch(console.dir);

app.listen(PORT, () => {
  console.log("server is running on port", PORT);
});
