// const express = require("express");
// const route = express.Router();
// const app = express();

// route.get("/sum",(req , resp)=>{
// const a = parseInt(req.query.a);
// const b = parseInt(req.query.b);

// resp.json({Result : a + b});
// });

// route.get("/subs",(req , resp)=>{
// const a = parseInt(req.query.a);
// const b = parseInt(req.query.b);

// resp.json({Result : a - b});
// });

// route.get("/multi", (req , resp)=>{
//     const a = parseInt(req.query.a);
//     const b = parseInt(req.query.b);

//     resp.json({Result : a * b});
// });

// route.get("/div" , (req , resp)=>{
// const a = parseInt(req.query.a);
// const b = parseInt(req.query.b);

// resp.json({Result : a / b});
// });

// app.use("/api", route);
// app.listen(5000, ()=>{
//     console.log("server running on port http://localhost:5000");
// });




const express = require("express");
const router = express.Router();
const Parking = require("../models/Parking");

const TOTAL_SLOTS = 10;



router.get("/slots", async (req, res) => {
  const occupied = await Parking.countDocuments({ status: "parked" });
  res.json({
    total: TOTAL_SLOTS,
    occupied,
    available: TOTAL_SLOTS - occupied
  });
});


router.post("/entry", async (req, res) => {
  try {
    const { vehicleNumber, vehicleType } = req.body;

    
    const exists = await Parking.findOne({ vehicleNumber, status: "parked" });
    if (exists) {
      return res.status(400).json({ message: "Vehicle already inside" });
    }

    const occupied = await Parking.countDocuments({ status: "parked" });
    if (occupied >= TOTAL_SLOTS) {
      return res.status(400).json({ message: "Parking Full" });
    }

    const slotNumber = occupied + 1;

    const data = new Parking({
      vehicleNumber,
      vehicleType,
      slotNumber
    });

    await data.save();

    res.json({ message: "Vehicle Entered", data });

  } catch (err) {
    res.status(500).json(err);
  }
});


router.put("/exit/:vehicleNumber", async (req, res) => {
  try {
    const parking = await Parking.findOne({
      vehicleNumber: req.params.vehicleNumber,
      status: "parked"
    });

    if (!parking) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    const exitTime = new Date();

    
    const duration = (exitTime - parking.entryTime) / (1000 * 60 * 60);

    
    const hours = Math.ceil(duration);

    const rate = parking.vehicleType === "car" ? 50 : 20;

    const amount = hours * rate;

    parking.exitTime = exitTime;
    parking.amount = amount;
    parking.status = "exited";

    await parking.save();

    res.json({
      message: "Vehicle Exited",
      duration: hours + " hours",
      amount,
      parking
    });

  } catch (err) {
    res.status(500).json(err);
  }
});



router.get("/search/:vehicleNumber", async (req, res) => {
  const data = await Parking.findOne({
    vehicleNumber: req.params.vehicleNumber
  });

  res.json(data);
});


router.get("/", async (req, res) => {
  const data = await Parking.find().sort({ entryTime: -1 });
  res.json(data);
});

module.exports = router;