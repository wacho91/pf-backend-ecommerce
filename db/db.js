// Conexión DB
require ("dotenv").config()
const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const {
  DB_USER, DB_PASSWORD, DB_HOST, DB_NAME, NODE_ENV, DB_PORT, DB_DEPLOY
} = process.env;

const sequelize = new Sequelize(
  `${DB_DEPLOY}` || `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}`,
  
  {
    logging: false, // set to console.log to see the raw SQL queries
    native: false, // lets Sequelize know we can use pg-native for ~30% more speed
    dialectOptions: {
      ssl: {
        require: true,
      },
    },
  }
);

// const sequelize = new Sequelize(`postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`, {
//   logging: false,
//   native: false,
// });

const basename = path.basename(__filename);

const modelDefiners = [];

fs.readdirSync(path.join(__dirname, '../models'))
  .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, '../models', file)));
  });

modelDefiners.forEach(model => model(sequelize));
let entries = Object.entries(sequelize.models);
let capsEntries = entries.map((entry) => [entry[0][0].toUpperCase() + entry[0].slice(1), entry[1]]);
sequelize.models = Object.fromEntries(capsEntries);

const { Productos, Usuarios, Ordenes, Favoritos, Comentarios } = sequelize.models;

Ordenes.belongsToMany(Usuarios, { through: 'orden_usuario' });
Usuarios.belongsToMany(Ordenes, { through: 'orden_usuario' });

Ordenes.belongsToMany(Productos, { through: 'orden_producto' });
Productos.belongsToMany(Ordenes, { through: 'orden_producto' });

Favoritos.belongsToMany(Productos, { through: 'favoritos_productos' });
Productos.belongsToMany(Favoritos, { through: 'favoritos_productos' });

Productos.hasMany(Comentarios);
Comentarios.belongsTo(Productos);

Usuarios.hasMany(Comentarios);
Comentarios.belongsTo(Usuarios);

module.exports = {
  ...sequelize.models,
  conn: sequelize,
};