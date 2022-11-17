const express = require("express");
const router = express.Router();

const { handleCustomFormSubmit } = require("../controller/custom-form");

router.post("/", handleCustomFormSubmit)

module.exports = router;
