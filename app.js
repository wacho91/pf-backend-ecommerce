const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const path = require('path');

const usuarioRouter = require('./routes/userRoutes.js');
const productoRouter = require('./routes/productRoutes.js');
const categoriaRouter = require('./routes/categoryRoutes.js');
const comentarioRouter = require('./routes/commentRouter.js');
const ordenRouter = require('./routes/ordersRoutes.js');
const favoritoRouter = require('./routes/favoriteRoutes.js');



require('./db/db.js');

const appserver = express();

appserver.name = 'API';



appserver.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
appserver.use(bodyParser.json({ limit: '50mb' }));
appserver.use(cookieParser());
appserver.use(morgan('dev'));
appserver.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
});

appserver.use('/products', productoRouter);
appserver.use('/', usuarioRouter);
// appserver.use('/payments', paymentsRouter);
appserver.use('/orders', ordenRouter);
appserver.use('/users', usuarioRouter);
appserver.use('/favorites', favoritoRouter);
appserver.use('/comments', comentarioRouter);
appserver.use('/categories', categoriaRouter);

// Servir archivos estáticos desde la carpeta 'upload'
appserver.use('/upload', express.static(path.join(__dirname, '/upload')));


appserver.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || err;
  console.error(err);
  res.status(status).send(message);
});

module.exports = appserver;