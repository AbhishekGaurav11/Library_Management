const express = require("express");
const router = express.Router();
const controller = require("../controllers/transactionController");

router.get("/", controller.getTransactions);
router.post("/borrow", controller.borrowBook);
router.post("/return", controller.returnBook);
router.post("/pay-fine", controller.payFine);

module.exports = router;