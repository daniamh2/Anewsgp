const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
// const compression = require("compression");
// const rateLimit = require("express-rate-limit");
// const hpp = require("hpp");
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

dotenv.config();
const ApiError = require("./utils/apiError");
const globalError = require("./middlewares/errorMiddleware");
//const dbConnection = require('./config/database');
// Routes
const mountRoutes = require("./routes");
//const { default: mongoose } = require("mongoose");

// const dbConnection = () => {
//   mongoose
//     .connect(process.env.DB_URI, {})
//     .then((conn) => {
//       console.log(`Database Connected: ${conn.connection.host}`);
//     })
//     .catch((err) => {
//       console.error(`Database Error: ${err}`);
//       process.exit(1);
//     });
// };
// Connect with db
const dbConnection=require("./config/database")

dbConnection();

// express app
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Enable other domains to access your application
app.use(cors());
app.options("*", cors());

// io.on('connection', (socket) => {
//   console.log('Client connected');

//   // اتصال الكاتب بـSocket.io
//   socket.on('writerConnected', (userId) => {
//     socket.join(userId);
//   });

//   // تحديث الكاتب بتغيير في المقال
//   socket.on('articleUpdated', (userId, articleId) => {
//     io.to(userId).emit('notification', { message: 'Your article has been updated by the editor.' });
//   });

//   socket.on('disconnect', () => {
//     console.log('Client disconnected');
//   });
// });


// compress all responses 
// app.use(compression());


// // Middlewares
 app.use(express.json({ limit: "20kb" }));
 app.use(express.static(path.join(__dirname, "uploads")));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

// // Limit each IP to 100 requests per `window` (here, per 15 minutes)
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100,
//   message:
//     "Too many accounts created from this IP, please try again after an hour",
// });

// // Apply the rate limiting middleware to all requests
// app.use("/api", limiter);

// // Middleware to protect against HTTP Parameter Pollution attacks
// app.use(
//   hpp({
//     whitelist: [
//       "price",
//       "sold",
//       "quantity",
//       "ratingsAverage",
//       "ratingsQuantity",
//     ], 
//   })
// );

// Mount Routes
mountRoutes(app);

app.all("*", (req, res, next) => {
  //create err and send it
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

// Global error handling middleware for express
app.use(globalError);

const PORT = process.env.PORT || 5000;
 server.listen(PORT, () => {
  console.log(`App running running on port ${PORT}${__dirname}`);
});
  
// Handle rejection outside express
process.on("unhandledRejection", (err) => {
  console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error(`Shutting down....`);
    process.exit(1);
  });
});
