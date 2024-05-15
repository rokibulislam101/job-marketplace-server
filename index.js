const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// Middleware setup
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mufx5zx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    console.log('Connected to MongoDB');

    const jobCollection = client.db('jobProject').collection('job');

    // Get all jobs
    app.get('/job', async (req, res) => {
      const jobs = await jobCollection.find().toArray();
      res.send(jobs);
    });

    // Get jobs by email
    app.get('/jobs/:email', async (req, res) => {
      const email = req.params.email;
      const jobs = await jobCollection.find({ email }).toArray();
      res.send(jobs);
    });

    // Get job by ID
    app.get('/job/:id', async (req, res) => {
      const id = req.params.id;
      const job = await jobCollection.findOne({ _id: new ObjectId(id) });
      res.send(job);
    });

    // Add a new job
    app.post('/job', async (req, res) => {
      const newjob = req.body;
      const result = await jobCollection.insertOne(newjob);
      res.send(result);
    });

    // Update a job
    app.put('/job/:id', async (req, res) => {
      const id = req.params.id;
      const updatedjob = req.body;

      const filter = { _id: new ObjectId(id) };
      const updateData = {
        $set: {
          title: updatedjob.title,
          category: updatedjob.category,
          salary: updatedjob.salary,
          number: updatedjob.number,
          postingDeadline: updatedjob.postingDeadline,
          applicationDeadline: updatedjob.applicationDeadline,
          status: updatedjob.status,
          description: updatedjob.description,
        },
      };

      const result = await jobCollection.updateOne(filter, updateData);
      res.send(result);
    });

    // Delete a job by ID
    app.delete('/job/:id', async (req, res) => {
      const id = req.params.id;
      const result = await jobCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Job Server is running');
});

app.listen(port, () => {
  console.log(`Job Server is running on port: ${port}`);
});