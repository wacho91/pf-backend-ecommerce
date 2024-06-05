const { Productos } = require("../db/db.js");
const { Op, where } = require("sequelize");
const fs = require('fs');
const path = require('path');

const loadDb = async () => {
  const getDb = await Productos.findAll();
  return getDb;
};


const obtenerProductos = async(req, res, next) => {
    try {
        const getDb = await loadDb();
        if(!getDb.length) {
            // si la bd esta vacia llamo a la api de productos para cargar los datos a la db
            const productos = getDb();
            let response = productos.map(p => {
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

    let decodificarLink = Buffer.from(miniatura, 'base64');
    let nombreImagenGuardada = `${Date.now()}.png`;
    let AlmacenamientoLinkImagen = path.join(__dirname, '../upload', nombreImagenGuardada);
    let linkImagenARenderizar = `upload/${nombreImagenGuardada}`;

    // Crea la carpeta 'upload' si no existe
    const directorioUpload = path.join(__dirname, '../upload');
    if (!fs.existsSync(directorioUpload)) {
      fs.mkdirSync(directorioUpload);
    }

    // Escribe el archivo de la imagen en la carpeta 'upload'
    fs.writeFileSync(AlmacenamientoLinkImagen, decodificarLink);

    const crearProducto = await Productos.create({
      id: `FB${Math.round(Math.random() * 1000000000)}`,
      miniatura: `http://localhost:3001/${linkImagenARenderizar}`,
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
      const decodificarLink = Buffer.from(miniatura, 'base64');
      const nombreImagenGuardada = `${Date.now()}.png`;
      const AlmacenamientoLinkImagen = `upload/${nombreImagenGuardada}`;
      fs.writeFileSync(AlmacenamientoLinkImagen, decodificarLink);
      actualizacion.miniatura = `http://localhost:3001/${AlmacenamientoLinkImagen}`;
    } else {
      actualizacion.miniatura = producto.miniatura;
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
}