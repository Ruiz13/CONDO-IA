const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function checkAndCreate() {
  try {
    const adminEmail = "admin@resimola.com";
    
    let user = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!user) {
      console.log("El usuario no existe, creando...");
      const tenant = await prisma.tenant.create({ data: { name: "Residencias Imola Torre A" } });
      const passwordHash = await bcrypt.hash("12345", 10);
      user = await prisma.user.create({
        data: {
          email: adminEmail,
          passwordHash,
          role: "ADMIN",
          mustChangePassword: true,
          tenantId: tenant.id
        }
      });
      console.log("Creado correctamente!");
    } else {
      console.log("El usuario ya existe.");
      // Verifiquemos si la contraseña es correcta
      const isValid = await bcrypt.compare("12345", user.passwordHash) || user.passwordHash === "12345";
      console.log("Contraseña 12345 es válida para este usuario?", isValid);
      
      // Forzar reset de clave por si acaso
      const passwordHash = await bcrypt.hash("12345", 10);
      await prisma.user.update({
        where: { email: adminEmail },
        data: { passwordHash }
      });
      console.log("Contraseña reseteada a 12345 por seguridad.");
    }
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}
checkAndCreate();
