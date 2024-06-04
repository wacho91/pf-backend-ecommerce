const { Router } = require("express");
const router = Router();
const { findFavorite, findOneFavorite, createFavorite, deleteFavorite } = require('../controller/favoriteController');

router.get('/:id', findFavorite);
router.get('/:id/:productoId', findOneFavorite);
router.post('/', createFavorite);
router.delete('/:id', deleteFavorite);

module.exports = router;