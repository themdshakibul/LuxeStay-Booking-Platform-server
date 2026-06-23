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
    const propertiesCollection = db.collection("properties");
    const bookingCollection = db.collection("bookings");
    const favoritesCollection = db.collection("favorites");
    const paymetnCollection = db.collection("payments");

    //? Admin

    // all properties get
    app.get("/api/admin/properties", async (req, res) => {
      const result = await propertiesCollection.find({}).toArray();
      res.json(result);
    });

    // Property status update (Approve/Reject)
    app.patch("/api/admin/properties/:id/status", async (req, res) => {
      const { id } = req.params;
      const { status, rejectionFeedback } = req.body;
      const result = await propertiesCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status, ...(rejectionFeedback && { rejectionFeedback }) } },
      );
      res.json({ success: true, result });
    });

    // Property delete
    app.delete("/api/admin/properties/:id", async (req, res) => {
      const { id } = req.params;
      const result = await propertiesCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.json({ success: true, result });
    });

    // all users get
    app.get("/api/admin/users", async (req, res) => {
      const usersCollection = db.collection("user");
      const result = await usersCollection.find({}).toArray();
      res.json(result);
    });

    // Role update
    app.patch("/api/admin/users/:id/role", async (req, res) => {
      const { id } = req.params;
      const { role } = req.body;
      const usersCollection = db.collection("user");
      const result = await usersCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { role } },
      );
      res.json({ success: true, result });
    });

    // Owner dashboard analyse
    app.get("/api/owner/analyse/:email", async (req, res) => {
      const { email } = req.params;

      const [totalProperties, totalBookings, payments] = await Promise.all([
        propertiesCollection.countDocuments({ ownerEmail: email }),
        bookingCollection.countDocuments({ ownerEmail: email }),
        paymetnCollection.find({ ownerEmail: email }).toArray(),
      ]);

      const totalEarnings = payments.reduce(
        (sum, p) => sum + (p.amount || 0),
        0,
      );

      res.json({ totalEarnings, totalProperties, totalBookings, payments });
    });

    //? payments propperties
    app.post("/api/payment", async (req, res) => {
      const data = req.body;

      const existing = await paymetnCollection.findOne({
        stripeSessionId: data.stripeSessionId,
      });

      if (existing) {
        return res.json({ success: false, message: "Already saved" });
      }

      const result = await paymetnCollection.insertOne({ ...data });
      res.json({ success: true, result });
    });

    // features properties
    app.get("/api/features", async (req, res) => {
      const result = await propertiesCollection.find().limit(6).toArray();
      res.json(result);
    });

    //? started
    // get all properties
    app.get("/api/property", async (req, res) => {
      const result = await propertiesCollection.find({}).toArray();
      res.json(result);
    });

    // get single property
    app.get("/api/property/:id", async (req, res) => {
      const { id } = req.params;
      const result = await propertiesCollection.findOne({
        _id: new ObjectId(id),
      });
      res.json(result);
    });

    // get property
    app.get("/api/myproperty/:email", async (req, res) => {
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

    // ? favorites new collection add korbo
    // user favorites
    app.get("/api/favorites/:email", async (req, res) => {
      const { email } = req.params;
      const result = await favoritesCollection
        .find({
          email: email,
        })
        .toArray();
      res.json(result);
    });

    // post favorites
    app.post("/api/favorites", async (req, res) => {
      const data = req.body;

      const existing = await favoritesCollection.findOne({
        email: data.email,
        favoritesId: data.favoritesId,
      });

      if (existing) {
        return res.json({ success: false, message: "Already in favorites" });
      }

      const result = await favoritesCollection.insertOne({ ...data });
      res.json({ success: true, result });
    });

    // delete favorites
    app.delete("/api/favorites/:id", async (req, res) => {
      const { id } = req.params;
      const result = await favoritesCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.json(result);
    });

    //? Tenents new collection add korbo

    // get Tenents overview
    app.get("/api/tenant/stats/:email", async (req, res) => {
      const { email } = req.params;

      const [bookings, favorites, activeRentals] = await Promise.all([
        bookingCollection.countDocuments({ email }),
        favoritesCollection.countDocuments({ email }),
        bookingCollection.countDocuments({ email, bookingStatus: "Approved" }),
      ]);

      res.json({ bookings, favorites, activeRentals });
    });

    // get booking
    app.get("/api/booking/:email", async (req, res) => {
      const { email } = req.params;
      const result = await bookingCollection
        .find({
          email: email,
        })
        .toArray();
      res.json(result);
    });

    // post booking
    app.post("/api/booking", async (req, res) => {
      const data = req.body;

      const existing = await bookingCollection.findOne({
        stripeSessionId: data.stripeSessionId,
      });

      if (existing) {
        return res.json({ success: false, message: "Already saved" });
      }

      const result = await bookingCollection.insertOne({ ...data });
      res.json({ success: true, result });
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
