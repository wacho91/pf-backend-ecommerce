const { Router } = require('express');
const router = Router();

const { 
    registrarUsuario,
    loguearUsuario,
    obtenerUsuarios,
    actualizarUsuario,
    borrarUsuario
} = require("../controller/userController.js");

router.get("/", obtenerUsuarios);
router.post("/register", registrarUsuario);
router.post("/login", loguearUsuario);
router.put("/:id", actualizarUsuario);
router.delete("/:id", borrarUsuario)




module.exports = router;