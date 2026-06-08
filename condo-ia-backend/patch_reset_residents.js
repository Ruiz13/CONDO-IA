const fs = require('fs');

// Agregar resetAllResidentPasswords al service
let svc = fs.readFileSync('src/tenants/tenants.service.ts', 'utf8');
const newMethod = `
  async resetAllResidentPasswords() {
    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash('admin123', 10);
    const result = await this.prisma.user.updateMany({
      where: { role: 'RESIDENT' },
      data: { passwordHash: hash, mustChangePassword: true }
    });
    return { success: true, updated: result.count, newPassword: 'admin123' };
  }
`;
svc = svc.replace('  async debugUsers()', newMethod + '  async debugUsers()');
fs.writeFileSync('src/tenants/tenants.service.ts', svc);
console.log('service OK');

// Agregar endpoint al controller
let ctrl = fs.readFileSync('src/tenants/tenants.controller.ts', 'utf8');
const newEndpoint = `
  @Post('reset-all-resident-passwords')
  async resetAllResidentPasswords() {
    return this.tenantsService.resetAllResidentPasswords();
  }

`;
ctrl = ctrl.replace("  @Get('debug-users')", newEndpoint + "  @Get('debug-users')");
fs.writeFileSync('src/tenants/tenants.controller.ts', ctrl);
console.log('controller OK');
