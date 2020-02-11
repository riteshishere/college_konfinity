const express = require("express");
const router = express.Router();
const getController = require("../controllers/getController");
const postController = require("../controllers/postController");
router.route("/").get(getController.users);
router.route("/register").get(getController.register);
router.route("/register").post(postController.register);
router.route("/del").post(postController.delete);
router.route("/edit").post(postController.edit);
router.route("/update").post(postController.update);
router.route("/test").get(getController.test);
router.route("/test").post(postController.test);
module.exports = router;