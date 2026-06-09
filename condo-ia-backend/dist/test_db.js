"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function run() { const t = await prisma.tenant.findFirst(); console.log('Tenant:', t?.id); if (t) {
    const ex = await prisma.expense.create({ data: { tenantId: t.id, description: 'Prueba', amount: 100, appliesTo: 'ALL' } });
    console.log(ex);
} }
run();
//# sourceMappingURL=test_db.js.map