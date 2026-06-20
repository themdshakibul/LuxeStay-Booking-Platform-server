const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion } = require("mongodb");
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
    const PropertiesCollection = db.collection("properties");
    const bookingCollection = db.collection("bookings");
    const paymetnCollection = db.collection("payments");

    app.post("/api/owner", async (req, res) => {
      const {
        title,
        description,
        location,
        propertyType,
        rent,
        rentType,
        bedrooms,
        bathrooms,
        propertySize,
        images,
        amenities,
        extraFeatures,
      } = req.body;

      const addeddata = {
        ...req.body,
        createdAt: new Date(),
        status: "active",
      };

      const result = await ownerCollection.insertOne(addeddata);
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
