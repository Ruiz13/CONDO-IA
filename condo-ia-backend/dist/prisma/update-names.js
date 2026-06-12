"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const nombres = ['Carlos', 'Ana', 'Luis', 'María', 'José', 'Laura', 'Pedro', 'Diana', 'Jorge', 'Elena', 'Francisco', 'Gabriela', 'Miguel', 'Sofía', 'David', 'Andrea', 'Manuel', 'Patricia', 'Alejandro', 'Carmen'];
const apellidos = ['Mendoza', 'Gómez', 'Rodríguez', 'Pérez', 'Martínez', 'Hernández', 'González', 'López', 'Sánchez', 'Torres', 'Ramírez', 'Flores', 'Díaz', 'Vásquez', 'Castillo', 'Ruiz', 'Alvarez', 'Jiménez'];
async function main() {
    console.log('Iniciando la actualización de nombres reales de propietarios...');
    const users = await prisma.user.findMany();
    let updatedCount = 0;
    for (const user of users) {
        if (user.role === 'ADMIN') {
            await prisma.user.update({
                where: { id: user.id },
                data: { name: 'Administrador Condo IA' }
            });
            updatedCount++;
        }
        else if (user.role === 'OWNER') {
            const hash = user.email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const name = `${nombres[hash % nombres.length]} ${apellidos[(hash * 3) % apellidos.length]}`;
            await prisma.user.update({
                where: { id: user.id },
                data: { name }
            });
            updatedCount++;
        }
    }
    console.log(`✅ Nombres actualizados para ${updatedCount} usuarios.`);
}
main()
    .catch((e) => console.error(e))
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=update-names.js.map