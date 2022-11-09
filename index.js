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

    //   create new user
    app.post("/api/user/create", async (req, res) => {
      const userData = req.body;
      const createdUser = await userCollections.insertOne(userData);
      res.json(createdUser);
    });

    app.get('/api/user',async(req,res)=>{
        const user = userCollections.find({})
        const users = await user.toArray()
        res.json(users)
    })
  } finally {
    // await client.close()
  }
};
run().catch(console.dir);

app.listen(PORT, () => {
  console.log("server is running on port", PORT);
});
