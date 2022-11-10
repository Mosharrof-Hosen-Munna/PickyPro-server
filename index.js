const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
const jwt = require("jsonwebtoken");
const { verifyJWT } = require("./middleware");

const PORT = process.env.PORT || 5000;

// MIDDLEWARE
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@project.wytfk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

app.get("/", (req, res) => {
  res.json("Server is running");
});

const run = async () => {
  try {
    // await client.connect();
    const database = client.db("PickyPro");
    const userCollections = database.collection("Users");
    const serviceCollections = database.collection("Services");
    const reviewCollections = database.collection("Reviews");

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

    app.post("/api/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
      res.json({ token });
    });

    // service api
    app.post("/api/service/create", async (req, res) => {
      const serviceData = req.body;
      const createdService = await serviceCollections.insertOne(serviceData);
      res.json(createdService);
    });

    app.get("/api/services", async (req, res) => {
      const cursor = serviceCollections.find({});
      const services = await cursor.toArray();
      res.json(services);
    });
    app.get("/api/services/limit", async (req, res) => {
      const cursor = serviceCollections.find({}, { sort: { date: -1 } });
      const services = await cursor.limit(3).toArray();
      res.json(services);
    });
    // get single service with service reviews
    app.get("/api/service/:serviceId", async (req, res) => {
      const id = req.params.serviceId;
      const service = await serviceCollections.findOne({ _id: ObjectId(id) });
      const cursor = reviewCollections.find(
        { serviceId: id },
        { sort: { time: -1 } }
      );
      const reviews = await cursor.toArray();
      const reverseReviews = reviews;
      res.json({ service, reviews: reverseReviews });
    });

    //  review api *******************/////

    app.post("/api/review/create", verifyJWT, async (req, res) => {
      const reviewData = req.body;
      const createdReview = await reviewCollections.insertOne(reviewData);
      const review = await reviewCollections.findOne({
        _id: ObjectId(createdReview.insertedId),
      });
      res.json(review);
    });

    // get all reviews for single user
    app.get("/api/reviews/user/:uid", verifyJWT, async (req, res) => {
      const uid = req.params.uid;

      if (req.user?.uid !== uid) {
        return res.json({ message: "unauthorized" });
      }
// find review with sort
      const cursor = reviewCollections.find(
        { "author.uid": uid },
        { sort: { time: -1 } } 
      );
      const reviews = await cursor.toArray();
      res.json(reviews);
    });

    app.put("/api/review/update/:reviewId", async (req, res) => {
      const reviewId = req.params.reviewId;
      const reviewData = req.body;
      const filter = { _id: ObjectId(reviewId) };
      const updateDoc = {
        $set: reviewData,
      };
      const result = await reviewCollections.updateOne(filter, updateDoc);
      const newReview = await reviewCollections.findOne(filter);
      res.json(newReview);
    });

    app.delete("/api/review/delete/:reviewId", async (req, res) => {
      const reviewId = req.params.reviewId;
      const filter = { _id: ObjectId(reviewId) };
      const result = await reviewCollections.deleteOne(filter);
      res.json(result);
    });
  } finally {
    // await client.close()
  }
};
run().catch((err) => console.log(err));

app.listen(PORT, () => {
  console.log("server is running on port", PORT);
});
