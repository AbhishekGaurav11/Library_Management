const express = require("express");
const router = express.Router();
const controller = require("../controllers/memberController");

router.get("/", controller.getMembers);
router.post("/", controller.createMember);

module.exports = router;