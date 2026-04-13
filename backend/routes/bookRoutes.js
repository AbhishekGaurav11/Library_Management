const express = require("express");
const router = express.Router();
const controller = require("../controllers/bookController");

router.get("/",               controller.getBooks);
router.post("/",              controller.createBook);
router.delete("/:id",         controller.deleteBook);
router.patch("/:id/copies",   controller.addCopies);

module.exports = router;