const express = require('express');
const prisma = require('./config/db');

const app = express();

app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// Other middleware and routes

module.exports = app;
