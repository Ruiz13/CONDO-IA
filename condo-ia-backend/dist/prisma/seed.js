"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Iniciando la siembra (seed) de la base de datos...');
    const tenant = await prisma.tenant.create({
        data: {
            name: 'Residencias Condo IA',
        },
    });
    console.log(`✅ Tenant creado: ${tenant.name}`);
    const defaultPassword = 'CondoIA2026*';
    const admin = await prisma.user.create({
        data: {
            tenantId: tenant.id,
            email: 'admin@condoia.com',
            passwordHash: defaultPassword,
            role: 'ADMIN',
        },
    });
    console.log(`✅ Administrador creado: ${admin.email}`);
    let apartmentsCreated = 0;
    for (let piso = 1; piso <= 11; piso++) {
        for (let apt = 1; apt <= 4; apt++) {
            const unitNumber = `${piso}-${apt}`;
            const ownerEmail = `propietario_${unitNumber}@condoia.com`;
            const owner = await prisma.user.create({
                data: {
                    tenantId: tenant.id,
                    email: ownerEmail,
                    passwordHash: defaultPassword,
                    role: 'OWNER',
                },
            });
            await prisma.unit.create({
                data: {
                    tenantId: tenant.id,
                    ownerId: owner.id,
                    unitNumber: unitNumber,
                    aliquotPercentage: 1.5,
                    isCommercial: false,
                },
            });
            apartmentsCreated++;
        }
    }
    console.log(`✅ ${apartmentsCreated} Apartamentos y propietarios creados.`);
    let localesCreated = 0;
    for (let local = 1; local <= 7; local++) {
        const unitNumber = `Local ${local}`;
        const ownerEmail = `propietario_local_${local}@condoia.com`;
        const owner = await prisma.user.create({
            data: {
                tenantId: tenant.id,
                email: ownerEmail,
                passwordHash: defaultPassword,
                role: 'OWNER',
            },
        });
        await prisma.unit.create({
            data: {
                tenantId: tenant.id,
                ownerId: owner.id,
                unitNumber: unitNumber,
                aliquotPercentage: 3.0,
                isCommercial: true,
            },
        });
        localesCreated++;
    }
    console.log(`✅ ${localesCreated} Locales comerciales y propietarios creados.`);
    console.log('🎉 Siembra completada con éxito.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map