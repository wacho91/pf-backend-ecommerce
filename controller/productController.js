const { Productos } = require("../db/db.js");
const { Op } = require("sequelize");
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configura Cloudinary con tus credenciales
cloudinary.config({
  cloud_name: 'deacm87l9',
  api_key: '174661533793152',
  api_secret: 'y3t4sKW0S_klH7obNlBKgrsyFiU'
});

const loadDb = async () => {
  const getDb = await Productos.findAll();
  return getDb;
};

const obtenerProductos = async(req, res, next) => {
  try {
      const getDb = await loadDb();
      if(!getDb.length) {
          let response = getDb.map(p => {
              return {
                  id: p.id,
                  titulo: p.titulo,
                  miniatura: p.miniatura,
                  precio: p.precio,
                  cantidadVendida: p.cantidadVendida,
                  cantidadDisponible: p.cantidadDisponible,
                  idCategoria: p.idCategoria,
                  categoria: p.categoria
              }
          });
          await Productos.bulkCreate(response);
          res.status(200).send(response);
      } else {
          const { titulo } = req.query;
          if (titulo) {
            const findProduct = await Productos.findAll({ where: { titulo: { [Op.iLike]: `%${titulo}%` } } });
            findProduct.length ? res.status(200).send(findProduct) : res.status(404).send('No se encontraron productos');
          }
          else {
            res.status(200).send(getDb)
          };
      };
  } catch (error) {
      console.log(error);
  }
}

const obtenerProducto = async (req, res, next) => {
  try {
    const { id } = req.params;
    if(id) {
      const findProduct = await Productos.findByPk(id);
      findProduct ? res.status(200).send(findProduct) : res.status(404).send('No se encontró el producto');
    };
  } catch (error) {
    next(error);
  };
};

const crearProducto = async (req, res, next) => {
  try {
    const { titulo, miniatura, precio, cantidadVendida, cantidadDisponible, idCategoria } = req.body;

    // Asegúrate de que todos los campos requeridos están presentes
    if (!(titulo && miniatura && precio && idCategoria)) {
      return res.status(400).send("No se llenaron todos los campos requeridos");
    }

    // Subir imagen a Cloudinary
    const resultado = await cloudinary.uploader.upload(miniatura, { folder: "productos" });

    const crearProducto = await Productos.create({
      id: `FB${Math.round(Math.random() * 1000000000)}`,
      miniatura: resultado.secure_url,
      titulo,
      precio,
      cantidadVendida: cantidadVendida || 0,
      cantidadDisponible: cantidadDisponible || 0,
      idCategoria,
      categoria: idCategoria === "FB100" ? "Jeans" : idCategoria === "FB110" ? "Blusas" : idCategoria === "FB120" ? "Vestidos" : idCategoria === "FB130" && "Chaquetas"
    });

    res.send({ created: true, crearProducto });
  } catch (error) {
    next(error);
  }
};

const productoActualizar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { titulo, miniatura, precio, cantidadVendida, cantidadDisponible } = req.body;
    const producto = await Productos.findByPk(id);

    if (!producto) {
      return res.status(404).send("Producto no encontrado");
    }

    let actualizacion = {
      titulo: titulo || producto.titulo,
      precio: precio || producto.precio,
      cantidadVendida: cantidadVendida || producto.cantidadVendida,
      cantidadDisponible: cantidadDisponible || producto.cantidadDisponible,
    };

    if (miniatura) {
      // Subir nueva imagen a Cloudinary
      const resultado = await cloudinary.uploader.upload(miniatura, { folder: "productos" });
      actualizacion.miniatura = resultado.secure_url;
    }

    await producto.update(actualizacion);

    res.send({ updated: true, producto });
  } catch (error) {
    next(error);
  }
};

const eliminarProducto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const producto = await Productos.findByPk(id);
    if (producto) {
      await producto.destroy();
      res.send({ "destroy": true });
    } else {
      res.status(404).send("Producto no encontrado");
    };
  } catch (error) {
    next(error);
  };
};

const actualizarStockProductos = async (req, res, next) => {
  try {
    const { id } = req.params;
    const producto = await Productos.findByPk(id);
    if (producto) {
      const { cantidadDisponible, cantidadVendida } = req.body;
      if (cantidadDisponible > producto.cantidadDisponible) { res.status(404).send('La cantidad de productos que intentas comprar excede el stock'); }
      producto.cantidadDisponible = producto.cantidadDisponible - cantidadDisponible;
      producto.cantidadVendida = producto.cantidadVendida + cantidadVendida;
      await producto.save();
      res.send("La compra se realizó correctamente");
    };
  } catch (error) {
    next(error);
  };
};

module.exports = {
  crearProducto,
  obtenerProductos,
  obtenerProducto,
  productoActualizar,
  eliminarProducto,
  actualizarStockProductos
};
