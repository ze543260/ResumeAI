#!/usr/bin/env node

const {
  connectDB,
  getConnectionInfo,
  disconnectDB,
} = require("../config/database");
require("dotenv").config();

async function testDatabaseConnection() {
  console.log("🔍 Testando conexão com banco de dados...\n");

  try {
    // Tentar conectar
    console.log("📡 Conectando ao MongoDB...");
    await connectDB();

    // Verificar informações da conexão
    const info = getConnectionInfo();
    console.log("\n✅ Conexão estabelecida com sucesso!");
    console.log("📊 Informações da conexão:");
    console.log(`   Estado: ${info.state}`);
    console.log(`   Host: ${info.host}`);
    console.log(`   Porta: ${info.port}`);
    console.log(`   Banco: ${info.name}`);

    // Testar uma operação simples
    const mongoose = require("mongoose");
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log(`   Collections: ${collections.length} encontradas`);

    if (collections.length > 0) {
      console.log("   📋 Collections existentes:");
      collections.forEach((col) => {
        console.log(`     - ${col.name}`);
      });
    }

    console.log("\n🎉 Teste de conexão finalizado com sucesso!");
  } catch (error) {
    console.error("\n❌ Erro ao conectar com o banco de dados:");
    console.error(`   ${error.message}`);

    // Diagnósticos específicos
    if (error.message.includes("ECONNREFUSED")) {
      console.error("\n🔧 Possíveis soluções:");
      console.error("   1. Verificar se o MongoDB está rodando");
      console.error("   2. Verificar se a porta 27017 está acessível");
      console.error("   3. Para MongoDB Atlas, verificar Network Access");
    }

    if (error.message.includes("authentication failed")) {
      console.error("\n🔧 Possíveis soluções:");
      console.error("   1. Verificar username e password no .env");
      console.error("   2. Verificar roles do usuário no MongoDB Atlas");
    }

    if (error.message.includes("getaddrinfo ENOTFOUND")) {
      console.error("\n🔧 Possíveis soluções:");
      console.error("   1. Verificar a URI de conexão no .env");
      console.error("   2. Verificar conectividade com a internet (Atlas)");
    }
  } finally {
    // Desconectar
    await disconnectDB();
    console.log("\n🔌 Desconectado do banco de dados");
    process.exit(0);
  }
}

// Executar o teste se for chamado diretamente
if (require.main === module) {
  testDatabaseConnection();
}

module.exports = { testDatabaseConnection };
