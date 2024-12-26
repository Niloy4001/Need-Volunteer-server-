require("dotenv").config();
const express = require("express");
var jwt = require("jsonwebtoken");
var cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const cors = require("cors");
const port = 4000;

app.use(
  cors({
    origin: ["http://localhost:5173", "https://need-volunteer-40.netlify.app"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster1.hcojg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// verifyjwtToken
const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).send({ message: "unAuthorized Access" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unAuthorizeddd accessss" });
    }
    req.user = decoded;
    next();
  });
  // console.log(req.user.email);
};

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const posts = client.db("NeedVolunteer").collection("posts");
    const volunteers = client.db("NeedVolunteer").collection("volunteers");
    const blogs = client.db("NeedVolunteer").collection("blogs");

    // // generate jwt
    // app.post("/jwt", (req, res) => {
    //   const email = req.body;
    //   const token = jwt.sign(email, process.env.ACCESS_TOKEN, {
    //     expiresIn: "365d",
    //   });

    //   res
    //     .cookie("token", token, {
    //       httpOnly: true,
    //       secure: process.env.NODE_ENV === "production",
    //       sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    //     })
    //     .send({ success: true });
    // });

    // // clear coockie
    // app.get("/logout", (req, res) => {
    //   console.log("in logout route");

    //   res
    //     .clearCookie("token", {
    //       httpOnly: true,
    //       secure: process.env.NODE_ENV === "production",
    //       sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    //     })
    //     .send({ message: true });

    //   console.log("cookies cleared");
    // });

    // get posts data for home page

    // jwt
    app.post("/jwt", (req, res) => {
      const email = req.body;

      const token = jwt.sign(email, process.env.ACCESS_TOKEN, {
        expiresIn: "2h",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ message: true });
    });

    // clear token during log out
    app.get("/logout", (req, res) => {
      res
        .clearCookie("token", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ message: true });
    });

    app.get("/needVolunteerPost", async (req, res) => {
      const query = {};
      const option = {
        sort: { deadline: 1 },
      };
      const result = await posts.find(query, option).limit(6).toArray();
      res.send(result);
    });

    // get all posts data
    app.get("/allPost", async (req, res) => {
      const search = req.query.search;
      let query = {
        postTitle: {
          $regex: search,
          $options: "i",
        },
      };

      const result = await posts.find(query).toArray();
      res.send(result);
    });

    // get a single post by id
    app.get(`/post/:id`, verifyToken, async (req, res) => {
      const id = req.params.id;
      const email = req.query.email;
      const query = { _id: new ObjectId(id) };
      const decodedEmail = req.user?.email;
      const result = await posts.findOne(query);

      // if (decodedEmail !== email) {
      //   return res.status(401).send({ message: "unAuthorized Access" });
      // }

      // console.log(result.organizer.email);

      res.send(result);
    });

    // post a data form add volunteer post page
    app.post("/addPost", verifyToken, async (req, res) => {
      const post = req.body;
      const email = req.query.email;
      const decodedEmail = req.user?.email;
      // console.log(email);
      if (decodedEmail !== email)
        return res.status(401).send({ message: "unauthorized access" });

      const result = await posts.insertOne(post);
      res.send(result);
      // console.log(result);
    });

    // post volunteers data to database
    app.post("/addVolunteer", async (req, res) => {
      const post = req.body;
      const result = await volunteers.insertOne(post);

      const query = { _id: new ObjectId(post.postId) };
      const updateDoc = {
        $inc: { volunteersNeeded: -1 },
      };
      const update = await posts.updateOne(query, updateDoc);
      res.send(result);
      // console.log(result);
    });

    // get myVolunteerNeed post by email
    app.get("/myNeedPost", verifyToken, async (req, res) => {
      const email = req.query.email;
      const query = { "organizer.email": email };
      const decodedEmail = req.user?.email;
      // console.log(query);

      if (decodedEmail !== email)
        return res.status(403).send({ message: "Forbidden" });

      const result = await posts.find(query).toArray();
      res.send(result);
    });

    // get myVolunteerRequested post by email
    app.get("/myRequestedPost", verifyToken, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.user?.email;
      const query = { "volunteer.email": email };
      // console.log(decodedEmail);
      // console.log(query);

      if (decodedEmail !== email) {
        return res.status(403).send({ message: "Forbidden" });
      }
      const result = await volunteers.find(query).toArray();
      res.send(result);
    });

    // delete my added post by id
    app.delete("/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await posts.deleteOne(query);
      res.send(result);
    });

    // delete my requested post by id
    app.delete("/deleteRequestedPost/:id", async (req, res) => {
      const id = req.params.id;

      // increament after deleting
      const postId = req.query?.postId;
      const filter = {_id: new ObjectId(postId)}
      const updateDoc = {
        $inc: { volunteersNeeded: 1 },
      };

      const post = await posts.updateOne(filter, updateDoc);
      // console.log(post);

      // delete operation
      const query = { _id: new ObjectId(id) };

      const result = await volunteers.deleteOne(query);
      res.send(result);
    });

    // update a document
    app.put("/update/:id", async (req, res) => {
      const id = req.params.id;
      const updatedePost = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          thumbnail: updatedePost.thumbnail,
          postTitle: updatedePost.postTitle,
          description: updatedePost.description,
          category: updatedePost.category,
          location: updatedePost.location,
          volunteersNeeded: updatedePost.volunteersNeeded,
          deadline: updatedePost.deadline,
          organizer: {
            name: updatedePost.organizer.name,
            email: updatedePost.organizer.email,
          },
          status: updatedePost.status,
        },
      };
      console.log(updateDoc);

      const result = await posts.updateOne(filter, updateDoc);
      res.send(result);
    });

    // get blogs
    app.get("/blogs", async (req, res) => {
      const result = await blogs.find().toArray();
      res.send(result);
    });
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
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
