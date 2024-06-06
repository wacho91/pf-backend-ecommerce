const { Usuarios } = require("../db/db.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Op } = require('sequelize');
const cloudinary = require('../config/cloudinaryConfig.js'); // Importar configuración de Cloudinary

const registrarUsuario = async (req, res, next) => {
  try {
    const { nombre, apellido, imagen, email, contraseña, celular, is_admin } = req.body;
    
    // Verificar campos obligatorios
    if (!(nombre && apellido && email && contraseña)) {
      return res.status(400).send("No se llenaron los campos obligatorios");
    }
    
    // Encriptar la contraseña
    const encriptarContraseña = await bcrypt.hash(contraseña, 10);
    
    let linkImagenARenderizar = null;
    
    // Manejar la imagen si se proporciona
    if (imagen) {
      const subirImagen = await cloudinary.uploader.upload(`data:image/png;base64,${imagen}`);
      linkImagenARenderizar = subirImagen.secure_url;
    }
    
    // Crear el usuario
    const crearUsuario = await Usuarios.create({
      id: `${Math.round(Math.random() * 1000000000)}`,
      nombre,
      apellido,
      imagen: linkImagenARenderizar ? linkImagenARenderizar : null,
      email,
      contraseña: encriptarContraseña,
      celular,
      is_admin: is_admin || false
    });
    
    // Enviar la respuesta con el usuario creado
    res.status(201).send({ creado: true, usuario: crearUsuario });
  } catch (error) {
    // Manejar errores
    next(error);
  }
};

const loguearUsuario = async (req, res, next) => {
  try {
    const { email, contraseña } = req.body;
    const usuario = await Usuarios.findOne({ where: { email } });
    if (usuario && (await bcrypt.compare(contraseña, usuario.contraseña))) {
      const token = jwt.sign({ usuario_id: usuario.id, email }, "secret", { expiresIn: "10h" });
      usuario.token = token;
      res.status(201).json({
        usuario: usuario,
        token: token
      });
    } else {
      res.status(404).send("Datos incorrectos");
    }
  } catch (error) {
    next(error);
  }
};

const obtenerUsuarios = async (req, res, next) => {
  try {
    const { id, nombre } = req.query;

    if (id) {
      const usuario = await Usuarios.findByPk(id);
      if (usuario) {
        return res.send(usuario);
      } else {
        return res.status(404).send("Usuario no encontrado");
      }
    }

    if (nombre) {
      const usuario = await Usuarios.findAll({ where: { nombre: { [Op.iLike]: `%${nombre}%` } } });
      if (usuario.length) {
        return res.send(usuario);
      } else {
        return res.status(404).send("Usuario no encontrado");
      }
    }

    const usuarios = await Usuarios.findAll();
    if (usuarios.length) {
      return res.send(usuarios);
    } else {
      return res.status(404).send("No existen usuarios registrados");
    }
  } catch (error) {
    next(error);
  }
};


const actualizarUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const usuario = await Usuarios.findByPk(id);

    if (!usuario) {
      return res.status(404).send({ error: 'Usuario no encontrado' });
    }

    const datosActualizados = {
      nombre: req.body.nombre || usuario.nombre,
      apellido: req.body.apellido || usuario.apellido,
      email: req.body.email || usuario.email,
      celular: req.body.celular || usuario.celular,
      is_admin: req.body.is_admin || false
    };

    if (req.body.imagen) {
      try {
        const subirImagen = await cloudinary.uploader.upload(`data:image/png;base64,${req.body.imagen}`);
        datosActualizados.imagen = subirImagen.secure_url;
      } catch (error) {
        // Manejar errores relacionados con la carga de la imagen
        return next(error);
      }
    }

    // Actualiza los datos del usuario
    const usuarioActualizado = await usuario.update(datosActualizados);

    // Verificar si la respuesta ya se envió antes de enviar una nueva respuesta
    if (!res.headersSent) {
      res.send({ updated: true, usuario: usuarioActualizado });
    }
  } catch (error) {
    // Manejar otros errores
    next(error);
  }
};

const borrarUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const eliminar = await Usuarios.destroy({ where: { id } });
    res.send({ destroy: true, eliminar });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registrarUsuario,
  loguearUsuario,
  obtenerUsuarios,
  actualizarUsuario,
  borrarUsuario
}
