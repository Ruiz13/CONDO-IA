const fs = require('fs');

// Agregar debugUsers al service
let svc = fs.readFileSync('src/tenants/tenants.service.ts', 'utf8');
const newMethod = `
  async debugUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        email: true,
        role: true,
        tenant: { select: { name: true, isActive: true } }
      },
      orderBy: { role: 'asc' }
    });
    return { total: users.length, users };
  }
`;
svc = svc.replace('  async reactivateAllTenants()', newMethod + '  async reactivateAllTenants()');
fs.writeFileSync('src/tenants/tenants.service.ts', svc);
console.log('service OK');

// Agregar debug-users al controller
let ctrl = fs.readFileSync('src/tenants/tenants.controller.ts', 'utf8');
const newEndpoint = `
  @Get('debug-users')
  async debugUsers() {
    return this.tenantsService.debugUsers();
  }

`;
ctrl = ctrl.replace("  @Post('reactivate-all')", newEndpoint + "  @Post('reactivate-all')");
fs.writeFileSync('src/tenants/tenants.controller.ts', ctrl);
console.log('controller OK');
