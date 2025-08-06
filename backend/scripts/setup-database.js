#!/usr/bin/env node

const { connectDB, disconnectDB } = require("../config/database");
const User = require("../models/User");
require("dotenv").config();

async function setupDatabase() {
  console.log("🏗️  Configurando banco de dados inicial...\n");

  try {
    // Conectar ao banco
    await connectDB();
    console.log("✅ Conectado ao banco de dados");

    // Criar índices necessários
    console.log("📊 Criando índices...");

    // Índices para User
    await User.createIndexes();
    console.log("   ✅ Índices do User criados");

    // TODO: Criar índices para outras collections quando implementadas
    // await Analysis.createIndexes();
    // await File.createIndexes();

    // Verificar se já existem usuários
    const userCount = await User.countDocuments();
    console.log(`📈 Usuários existentes: ${userCount}`);

    // Criar usuário admin de exemplo (opcional)
    if (userCount === 0) {
      console.log("👤 Criando usuário admin de exemplo...");

      const adminUser = new User({
        name: "Administrator",
        email: "admin@resumeanalyzer.com",
        password: "admin123", // Será hasheado automaticamente pelo modelo
        role: "admin",
      });

      await adminUser.save();
      console.log("   ✅ Usuário admin criado");
      console.log("   📧 Email: admin@resumeanalyzer.com");
      console.log("   🔑 Senha: admin123");
      console.log("   ⚠️  ALTERE A SENHA EM PRODUÇÃO!");
    }

    console.log("\n🎉 Configuração do banco de dados concluída!");
  } catch (error) {
    console.error("\n❌ Erro na configuração do banco:");
    console.error(`   ${error.message}`);
    process.exit(1);
  } finally {
    await disconnectDB();
    console.log("\n🔌 Desconectado do banco de dados");
    process.exit(0);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };
