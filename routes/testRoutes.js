const express = require("express");
const router = express.Router();
const Test = require("../models/Test");

router.post("/add", async (req, res) => {

  try {

    const data = new Test({
      name: req.body.name
    });

    await data.save();

    res.json({
      message: "Saved successfully",
      data
    });

  } catch(err){
    res.status(500).json(err);
  }

});

router.get("/all", async (req, res) => {

  const data = await Test.find();

  res.json(data);

});

const sendEmail = require("../utils/sendEmail");

router.get("/mail-test", async (req, res) => {
  try {

    await sendEmail(
      "shankaryuday@gmail.com",
      "Manual Email Test",
      "This email is sent manually from your backend."
    );

    res.send("Email sent successfully");

  } catch (err) {
    console.log(err);
    res.send("Email failed");
  }
});

module.exports = router;