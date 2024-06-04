const { Router } = require("express");
const router = Router();
const { obtenerComentariosUsuario, obtenerComentario, crearComentario } = require('../controller/commentController.js');

router.get('/user/:id', obtenerComentariosUsuario);
router.get('/:id', obtenerComentario);
router.post('/:idProduct', crearComentario);

module.exports = router;