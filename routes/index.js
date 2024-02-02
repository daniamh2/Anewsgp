  // const http = require('http');
  // const socketIO = require('socket.io');
  const notificationRouter = require('./notRoute');
const sectionRoute = require('./sectionRoute');
const postRoute = require('./postRoute');
const copyRoute = require('./copyRoute');
const userRoute = require('./userRoute');
const authRoute = require('./authRoute');
const readersRoute=require('./readersRoute');

const mountRoutes = (app) => {
  app.use('/api/v1/sections', sectionRoute);
  app.use('/api/v1/posts', postRoute);
  app.use('/api/v1/process', copyRoute);
  app.use('/api/v1/users', userRoute);
  app.use('/api/v1/auth', authRoute);
  app.use('/api/v1/home', readersRoute);
  app.use('/api/v1/notifications', notificationRouter);

};

module.exports = mountRoutes;
 