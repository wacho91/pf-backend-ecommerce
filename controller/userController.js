const { Usuarios } = require("../db/db.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { where } = require("sequelize");
const { Op } = require('sequelize');
const fs = require('fs');



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
      const decodificarLink = Buffer.from(imagen, 'base64');
      const nombreImagenGuardada = `${Date.now()}.png`;
      const AlmacenamientoLinkImagen = `upload/${nombreImagenGuardada}`;
      linkImagenARenderizar = `upload/${nombreImagenGuardada}`;
      
      // Guardar la imagen en el sistema de archivos
      fs.writeFileSync(AlmacenamientoLinkImagen, decodificarLink);
    }
    
    // Crear el usuario
    const crearUsuario = await Usuarios.create({
      id: `${Math.round(Math.random() * 1000000000)}`,
      nombre,
      apellido,
      imagen: linkImagenARenderizar ? `http://localhost:3001/${linkImagenARenderizar}` : null,
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
    const {email, contraseña} = req.body;
    const usuario = await Usuarios.findOne({ where: { email } });
    if (usuario && (await bcrypt.compare(contraseña, usuario.contraseña))) {
      const token = jwt.sign({ usuario_id: usuario.id, email }, "secret", { expiresIn: "10h" });
      usuario.token = token;
      res.status(201).json({
        "usuario": usuario,
        "token": token
      });
    } else {
      res.status(404).send("Datos incorrectos");
    };
  } catch (error) {
    next(error);
  }

}


const obtenerUsuarios = async(req, res, next) => {
  try {
    const { id, nombre } = req.query;
    if (id) {
      const usuario = await Usuarios.findByPk(id);
      usuario ? res.send(usuario) : res.status(404).send("Usuario no encontrado");
    };
    if (nombre) {
      const usuario = await Usuarios.findAll({ where: { nombre: { [Op.iLike]: `%${nombre}%` } } });
      usuario.length ? res.send(usuario) : res.status(404).send("Usuario no encontrado");
    } else {
      const usuarios = await Usuarios.findAll();
      usuarios.length ? res.send(usuarios) : res.status(404).send("No existen usuarios registrados");
    };
  } catch (error) {
    next(error);
  }
}

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
        const { imagen, nombreImagenGuardada, linkImagenARenderizar } = await guardarImagen(req.body.imagen);
        datosActualizados.imagen = `http://localhost:3001/${linkImagenARenderizar}`;
      } catch (error) {
        // Manejar errores relacionados con guardarImagen
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




const guardarImagen = async (imagenBase64) => {
  const decodificarLink = Buffer.from(imagenBase64, 'base64');
  const nombreImagenGuardada = `${Date.now()}.png`;
  const AlmacenamientoLinkImagen = `upload/${nombreImagenGuardada}`;
  const linkImagenARenderizar = `upload/${nombreImagenGuardada}`;

  fs.writeFileSync(AlmacenamientoLinkImagen, decodificarLink);

  return { imagen: decodificarLink, nombreImagenGuardada, linkImagenARenderizar };
};


const borrarUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const eliminar = await Usuarios.destroy({ where: { id } });
    res.send({ destroy: true, eliminar });
  } catch (error) {
    next(error);
  };
};

module.exports = {
  registrarUsuario,
  loguearUsuario,
  obtenerUsuarios,
  actualizarUsuario,
  borrarUsuario
}