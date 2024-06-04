const { Ordenes, Usuarios, Productos } = require('../db/db.js');

const findAllOrder = async (req, res, next) => {
  try {
    const { id } = req.query;
    if (id) {
      const orden = await Ordenes.findOne({ where: { id }, include: { all: true } });
      orden ? res.send(orden) : res.status(404).send("No existen órdenes con ese id");
    } else {
      const ordenesTotales = await Ordenes.findAll({ include: { all: true } });
      ordenesTotales.length ? res.send(ordenesTotales) : res.status(404).send("No existen órdenes registradas");
    };
  } catch (error) {
    next(error);
  };
};

const findOneOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const contenedor = await Ordenes.findOne({ where: { id }, include: { all: true } });
    contenedor ? res.send(contenedor) : res.status(404).send("Orden no encontrada");
  } catch (error) {
    next(error);
  };
};

const findAllOrderUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ordenes = await Ordenes.findAll({ where: { idUsuario: id }, include: Productos });
    ordenes.length ? res.send(ordenes) : res.status(404).send("El usuario no tiene órdenes realizadas");
  } catch (error) {
    next(error);
  };
};

const createOrder = async (req, res, next) => {
  try {
    const {idUsuario,  precio_orden, productId} = req.body;

    console.log(req.body)
    const crearOrden = await Ordenes.create({ 
      idUsuario,
      fecha: new Date(),
      estado: "pendiente", 
      precio_orden 
    });

    // Agregar productos a la orden
    for (const productoId of productId) {
      await crearOrden.addProductos(productoId);
    }

    //Metodo para agregar el usuario a la orden
    const usuario = await Usuarios.findByPk(idUsuario);
    await crearOrden.setUsuarios([usuario.id]);

    return res.status(201).send(crearOrden);

  } catch (error) {
    next(error);
  }
};

const updateOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const orden = await Ordenes.findOne({ where: { id } });
    if (orden) {
      await orden.update({ estado });
      res.status(200).send("Orden actualizada");
    } else {
      res.status(404).send("No existe orden con ese id");
    }
  } catch (error) {
    next(error);
  };
};

const deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Ordenes.destroy({ where: { id } });
    res.send({ destroy: true });
  } catch (error) {
    next(error);
  };
};

module.exports = {
  findAllOrder,
  findOneOrder,
  findAllOrderUser,
  createOrder,
  updateOrder,
  deleteOrder
};