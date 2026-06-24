const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { jwtVerify, createRemoteJWKSet } = require("jose-cjs");
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

// JWT verify
const JWKS = createRemoteJWKSet(
  new URL(`${process.env.BETTER_AUTH_URL}/api/auth/jwks`),
);

// veryfy token

const verifyToken = async (req, res, next) => {
  const authHeders = req.headers.authorization;
  console.log(authHeders);

  if (!authHeders || !authHeders.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const token = authHeders.split(" ")[1];
  console.log(token);

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const { payload } = await jwtVerify(token, JWKS);
    req.user = payload;

    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

const ownerVerify = async (req, res, next) => {
  const user = req.user;

  console.log(user);

  if (user.role !== "owner") {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

const adminVerify = async (req, res, next) => {
  const user = req.user;

  if (user.role !== "admin") {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

async function run() {
  try {
    const db = client.db("rental");
    const propertiesCollection = db.collection("properties");
    const bookingCollection = db.collection("bookings");
    const favoritesCollection = db.collection("favorites");
    const reviewCollection = db.collection("reviews");
    const paymetnCollection = db.collection("payments");

    //? Admin

    // Admin overview stats
    app.get("/api/admin/stats", async (req, res) => {
      const usersCollection = db.collection("user");

      const [
        totalUsers,
        totalOwners,
        totalProperties,
        totalBookings,
        payments,
      ] = await Promise.all([
        usersCollection.countDocuments({}),
        usersCollection.countDocuments({ role: "owner" }),
        propertiesCollection.countDocuments({}),
        bookingCollection.countDocuments({}),
        paymetnCollection.find({}).toArray(),
      ]);

      res.json({
        totalUsers,
        totalOwners,
        totalProperties,
        totalBookings,
        payments,
      });
    });

    // all bookings get
    app.get("/api/admin/bookings", async (req, res) => {
      const result = await bookingCollection.find({}).toArray();
      res.json(result);
    });

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

    // ?Owner dashboard analyse

    // Owner all bookings get
    app.get("/api/owner/bookings/:email", async (req, res) => {
      const { email } = req.params;
      const result = await bookingCollection
        .find({ ownerEmail: email })
        .toArray();
      res.json(result);
    });

    // Booking status update
    app.patch("/api/owner/bookings/:id/status", async (req, res) => {
      const { id } = req.params;
      const { bookingStatus } = req.body;
      const result = await bookingCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { bookingStatus } },
      );
      res.json({ success: true, result });
    });

    // owner analyse
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

    // Review post
    app.post("/api/reviews", async (req, res) => {
      const data = req.body;
      const result = await reviewCollection.insertOne({
        ...data,
        createdAt: new Date(),
      });
      res.json({ success: true, result });
    });

    // Property all reviews get
    app.get("/api/reviews/:propertyId", async (req, res) => {
      const { propertyId } = req.params;
      const result = await reviewCollection
        .find({ propertyId })
        .sort({ createdAt: -1 })
        .toArray();
      res.json(result);
    });

    // Tenant reviews get
    app.get("/api/reviews/user/:email", async (req, res) => {
      const { email } = req.params;
      const result = await reviewCollection
        .find({ email })
        .sort({ createdAt: -1 })
        .toArray();
      res.json(result);
    });

    //? started

    app.get("/api/property", async (req, res) => {
      try {
        const {
          search,
          propertyType,
          minPrice,
          maxPrice,
          sort,
          page = 1,
          limit = 9,
        } = req.query;

        const pageNum = Number(page);
        const limitNum = Number(limit);

        const matchStage = {
          status: { $regex: "^approved$", $options: "i" },
        };

        if (search) {
          matchStage.$or = [
            { title: { $regex: search, $options: "i" } },
            { location: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
          ];
        }

        if (propertyType && propertyType !== "All") {
          matchStage.propertyType = propertyType;
        }

        const pipeline = [
          { $match: matchStage },
          {
            $addFields: {
              numericRent: { $toDouble: "$rent" },
            },
          },
        ];

        if (minPrice || maxPrice) {
          const priceFilter = {};
          if (minPrice) priceFilter.$gte = Number(minPrice);
          if (maxPrice) priceFilter.$lte = Number(maxPrice);
          pipeline.push({ $match: { numericRent: priceFilter } });
        }

        const sortStage = {};
        if (sort === "price_asc") sortStage.numericRent = 1;
        else if (sort === "price_desc") sortStage.numericRent = -1;
        else sortStage.createdAt = -1;

        pipeline.push({ $sort: sortStage });

        const [result] = await propertiesCollection
          .aggregate([
            ...pipeline,
            {
              $facet: {
                data: [
                  { $skip: (pageNum - 1) * limitNum },
                  { $limit: limitNum },
                ],
                total: [{ $count: "count" }],
              },
            },
          ])
          .toArray();

        const data = result?.data || [];
        const total = result?.total[0]?.count || 0;
        const totalPages = total > 0 ? Math.ceil(total / limitNum) : 1;

        res.json({
          data,
          total,
          totalPages,
          currentPage: pageNum,
        });
      } catch (error) {
        console.error("Error fetching properties:", error);
        res.status(500).json({ message: "Server Error" });
      }
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
    app.post("/api/property", verifyToken, ownerVerify, async (req, res) => {
      const data = req.body;
      const result = await propertiesCollection.insertOne({
        ...data,
        userId: req.user.id,
      });
      res.json(result);
    });

    // update property
    app.patch(
      "/api/property/:id",
      verifyToken,
      ownerVerify,
      async (req, res) => {
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
      },
    );

    // delte property
    app.delete(
      "/api/property/:id",
      verifyToken,
      ownerVerify,
      async (req, res) => {
        const { id } = req.params;
        const result = await propertiesCollection.deleteOne({
          _id: new ObjectId(id),
        });
        res.json(result);
      },
    );

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
