const { Router } = require("express");
const router = Router();
const { deleteCategory } = require('../controller/categoryController.js');

router.delete('/:id', deleteCategory);

module.exports = router;