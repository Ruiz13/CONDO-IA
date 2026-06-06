const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function createSuperAdmin() {
  try {
    const email = "ruizherreno@gmail.com";
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    
    if (existingUser) {
      // Just update their role to SUPER_ADMIN
      await prisma.user.update({
        where: { email },
        data: { role: 'SUPER_ADMIN', tenantId: null }
      });
      console.log("¡Usuario existente actualizado a SUPER_ADMIN!");
    } else {
      const passwordHash = await bcrypt.hash("admin123", 10);
      await prisma.user.create({
        data: {
          email,
          passwordHash,
          role: 'SUPER_ADMIN',
          mustChangePassword: false,
          tenantId: null // No pertenece a ningún edificio en particular
        }
      });
      console.log("¡Súper Administrador LUIS ALBERTO RUIZ creado con éxito!");
    }
  } catch (error) {
    console.error("Error creating Super Admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin();
