const { Router } = require('express');
const router = Router();

const { 
    crearProducto,
    obtenerProductos,
    productoActualizar, 
    obtenerProducto,
    eliminarProducto,
    actualizarStockProductos
} = require("../controller/productController.js");


router.get("/", obtenerProductos);
router.get("/:id", obtenerProducto);
router.post("/", crearProducto);
router.put("/:id", productoActualizar);
router.put("/shoppingcart/:id", actualizarStockProductos);
router.delete("/:id", eliminarProducto);


module.exports = router;