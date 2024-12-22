require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const cors = require("cors");
const port = 4000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster1.hcojg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const posts = client.db("NeedVolunteer").collection("posts");
    const volunteers = client.db("NeedVolunteer").collection("volunteers");

    // get posts data for home page
    app.get("/needVolunteerPost", async (req, res) => {
      const query = {};
      const option = {
        sort: { deadline: 1 },
      };
      const result = await posts.find(query, option).limit(6).toArray();
      res.send(result);
    });

    // get a single post by id
    app.get(`/post/:id`, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await posts.findOne(query);
      res.send(result);
    });

    // post a data form add volunteer post page
    app.post("/addPost", async (req, res) => {
      const post = req.body;
      const result = await posts.insertOne(post);
      res.send(result);
      // console.log(result);
    });

    // post volunteers data to database
    app.post("/addVolunteer", async (req, res) => {
      const post = req.body;
      const result = await volunteers.insertOne(post);
      res.send(result);
      // console.log(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
