const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.7bquc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("furnitureMart");
    const servicesCollection = database.collection("services");
    const usersCollection = database.collection("users");
    const orderCollection = database.collection("orders");
    const ratingCollection = database.collection("rating");

    // -----------Create (POST)---------------//
    // POST API (add a product by admin from MongoDB to home)
    app.post("/services", async (req, res) => {
      const service = req.body;
      console.log("hitting the post API", service);
      const result = await servicesCollection.insertOne(service);
      console.log(result);
      res.json(result);
    });
    //POST api for email password (from registration)
    app.post("/users", async (req, res) => {
      const users = req.body;
      console.log(users);
      const result = await usersCollection.insertOne(users);
      res.json(result);
    });

    // POST Order (clicking purchase button & add order from there in add order)
    app.post("/addOrders", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      console.log(result);
      res.json(result);
    });

    // POST Review (in Dashboard: review button)
    app.post("/rating", async (req, res) => {
      const rating = req.body;
      const result = await ratingCollection.insertOne(rating);
      console.log(result);
      res.json(result);
    });

    // -----------Read (GET)---------------//

    // Get API
    app.get("/services", async (req, res) => {
      const cursor = servicesCollection.find({});
      const service = await cursor.toArray();
      res.send(service);
    });

    // Get Single product
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      console.log("getting specific service", id);
      const query = { _id: ObjectId(id) };
      const service = await servicesCollection.findOne(query);
      res.json(service);
    });

    // admin panel check out
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    // Get my orders
    app.get("/orders/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const service = await orderCollection.find(filter).toArray();
      res.json(service);
    });

    //Get orders
    app.get("/orders", async (req, res) => {
      const cursor = orderCollection.find({});
      const orders = await cursor.toArray();
      res.send(orders);
    });

    //Get Rating (Show in home page)
    app.get("/rating", async (req, res) => {
      const cursor = ratingCollection.find({});
      const rating = await cursor.toArray();
      res.json(rating);
    });

    // -----------Update (PUT)---------------//

    //Update admin (make a user a admin)
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      console.log("put", user);
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    // Update order
    app.put("/update/:id", async (req, res) => {
      const id = req.params.id;
      const updatedOrder = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: updatedOrder.status,
        },
      };
      const result = await orderCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      console.log("updating", id);
      res.json(result);
    });

    // -----------Delete (delete)---------------//
    // DELETE API
    app.delete("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await servicesCollection.deleteOne(query);
      res.json(result);
    });

    // DELETE (cancel) an order
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("starting live green");
});

// Modification check up

// app.get("/hello", (req, res) => {
//   res.send("hello, this is updated");
// });

app.listen(port, () => {
  console.log("Running live green on port", port);
});
