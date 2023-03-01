const express = require('express');
const router = express.Router();
const userController = require("../controllers/userController");
const middleware = require("../middleware/middleware")


//------------------------------USER API -----------------------------------***

router.post("/register",userController.createUser)

router.post("/login", userController.login)

router.put("/updateUsr/:userId", middleware.Mid1, userController.updateUser)

module.exports = router;
