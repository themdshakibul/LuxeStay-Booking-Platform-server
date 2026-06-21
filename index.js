const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
dotenv.config();

const port = process.env.PORT;
const uri = process.env.MONGO_URI;

const app = express();
app.use(cors());
app.use(express.json());

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const db = client.db("rental");
    const ownerCollection = db.collection("owners");
    const propertiesCollection = db.collection("properties");
    const bookingCollection = db.collection("bookings");
    const paymetnCollection = db.collection("payments");

    // create owner
    // app.post("/api/owner", async (req, res) => {
    //   const {
    //     title,
    //     description,
    //     location,
    //     propertyType,
    //     rent,
    //     rentType,
    //     bedrooms,
    //     bathrooms,
    //     propertySize,
    //     images,
    //     amenities,
    //     extraFeatures,
    //   } = req.body;

    //   const addeddata = {
    //     ...req.body,
    //     createdAt: new Date(),
    //     status: "active",
    //   };

    //   const result = await ownerCollection.insertOne(addeddata);
    //   res.json(result);
    // });

    //? started
    // get property
    app.get("/api/property/:email", async (req, res) => {
      const { email } = req.params;
      const result = await propertiesCollection
        .find({
          ownerEmail: email,
        })
        .toArray();
      res.json(result);
    });

    // post property
    app.post("/api/property", async (req, res) => {
      const data = req.body;
      const result = await propertiesCollection.insertOne({
        ...data,
      });
      res.json(result);
    });

    // update property
    app.patch("/api/property/:id", async (req, res) => {
      const { id } = req.params;
      const updatedData = req.body;
      const result = await propertiesCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            ...updatedData,
          },
        },
      );
      res.json(result);
    });

    // delte property
    app.delete("/api/property/:id", async (req, res) => {
      const { id } = req.params;
      const result = await propertiesCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.json(result);
    });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello rento booking server!");
});

app.listen(port, () => {
  console.log(`welcome to rento-booking-server on port ${port}`);
});
