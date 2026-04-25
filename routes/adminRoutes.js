const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

router.get("/products", authMiddleware, (req,res)=>{

   if(req.user.role !== "admin")
      return res.status(403).json({msg:"Not admin"})

   res.json("Admin access granted")

})

module.exports = router;