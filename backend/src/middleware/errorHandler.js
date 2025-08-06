const logger = require("../../config/logger");

// Middleware para tratamento de erros
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error(`Error: ${error.message}`, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found";
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    error = { message: message.join(", "), statusCode: 400 };
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token";
    error = { message, statusCode: 401 };
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token expired";
    error = { message, statusCode: 401 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

// Middleware para rotas não encontradas
const notFound = (req, res, next) => {
  const message = `Route ${req.originalUrl} not found`;
  logger.warn(message);
  res.status(404).json({
    success: false,
    message,
  });
};

// Middleware para logging de requisições
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info(
      `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`,
      {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      }
    );
  });

  next();
};

// Middleware para validação de Content-Type
const validateContentType = (allowedTypes = ["application/json"]) => {
  return (req, res, next) => {
    if (req.method === "GET" || req.method === "DELETE") {
      return next();
    }

    const contentType = req.get("Content-Type");

    if (!contentType) {
      return res.status(400).json({
        success: false,
        message: "Content-Type header is required",
      });
    }

    const isAllowed = allowedTypes.some((type) => contentType.includes(type));

    if (!isAllowed && !contentType.includes("multipart/form-data")) {
      return res.status(415).json({
        success: false,
        message: `Unsupported Content-Type. Allowed: ${allowedTypes.join(
          ", "
        )}, multipart/form-data`,
      });
    }

    next();
  };
};

// Middleware para sanitização básica
const sanitizeInput = (req, res, next) => {
  // Remover propriedades potencialmente perigosas
  const dangerousProps = ["__proto__", "constructor", "prototype"];

  const sanitizeObject = (obj) => {
    if (obj && typeof obj === "object") {
      dangerousProps.forEach((prop) => {
        delete obj[prop];
      });

      Object.keys(obj).forEach((key) => {
        if (typeof obj[key] === "object") {
          sanitizeObject(obj[key]);
        }
      });
    }
  };

  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);

  next();
};

// Middleware para cache headers
const setCacheHeaders = (maxAge = 3600) => {
  return (req, res, next) => {
    if (req.method === "GET") {
      res.set("Cache-Control", `public, max-age=${maxAge}`);
    } else {
      res.set("Cache-Control", "no-cache, no-store, must-revalidate");
    }
    next();
  };
};

module.exports = {
  errorHandler,
  notFound,
  requestLogger,
  validateContentType,
  sanitizeInput,
  setCacheHeaders,
};
