const requestLogger = (req, res, next) => {
  console.log(`${req.method} ${req.url} route is being called.`);
  next(); // Call the next middleware or route handler
};

export default requestLogger;
