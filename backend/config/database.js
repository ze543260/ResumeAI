const mongoose = require("mongoose");
const logger = require("./logger");

const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/resume-analyzer";

    // Configurações de conexão
    const options = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };

    const conn = await mongoose.connect(mongoURI, options);

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    // Event listeners para monitoramento
    mongoose.connection.on("connected", () => {
      logger.info("Mongoose connected to MongoDB");
    });

    mongoose.connection.on("error", (err) => {
      logger.error(`Mongoose connection error: ${err.message}`);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("Mongoose disconnected from MongoDB");
    });

    // Graceful close
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      logger.info("MongoDB connection closed through app termination");
      process.exit(0);
    });

    return conn;
  } catch (error) {
    logger.error(`Database connection error: ${error.message}`);
    console.error(`❌ Database connection error: ${error.message}`);

    // Log específico para diferentes tipos de erro
    if (error.name === "MongooseServerSelectionError") {
      console.error(
        "🔍 Verifique se o MongoDB está rodando e a URI está correta"
      );
      console.error(
        "💡 Para MongoDB Atlas, verifique Network Access e Database Access"
      );
    }

    if (error.name === "MongoParseError") {
      console.error("🔗 Verifique o formato da URI de conexão no arquivo .env");
    }

    process.exit(1);
  }
};

// Função para verificar se a conexão está ativa
const isConnected = () => {
  return mongoose.connection.readyState === 1;
};

// Função para desconectar (útil para testes)
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    logger.info("Database disconnected");
  } catch (error) {
    logger.error(`Error disconnecting from database: ${error.message}`);
  }
};

// Função para obter informações de status da conexão
const getConnectionInfo = () => {
  const state = mongoose.connection.readyState;
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  return {
    state: states[state] || "unknown",
    host: mongoose.connection.host,
    name: mongoose.connection.name,
    port: mongoose.connection.port,
  };
};

module.exports = {
  connectDB,
  isConnected,
  disconnectDB,
  getConnectionInfo,
};
