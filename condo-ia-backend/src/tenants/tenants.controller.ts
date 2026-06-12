import { Controller, Post, Body, Get, Param, Delete, Patch } from '@nestjs/common';
import { TenantsService } from './tenants.service';

@Controller('api/tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post('onboard')
  async onboardTenant(
    @Body() body: {
      name: string;
      floors: number;
      aptsPerFloor: number;
      locales: number;
      aptAliquot: number;
      apiKey?: string;
      address?: string;
      city?: string;
      state?: string;
      country?: string;
      phone?: string;
    }
  ) {
    return this.tenantsService.onboardTenant(body);
  }

  @Get()
  async getAllTenants() {
    return this.tenantsService.getAllTenants();
  }

  @Get('version')
  version() {
    return { version: 'bcryptjs-v13' };
  }

  @Post('db-push-sync')
  async dbPushSync() {
    const { execSync } = require('child_process');
    const dbUrl = process.env.DATABASE_URL || '';
    const directUrl = dbUrl.replace('-pooler', '').replace('&pgbouncer=true', '').replace('?pgbouncer=true', '');
    try {
      const stdout = execSync('npx prisma db push --accept-data-loss', {
        env: { ...process.env, DIRECT_URL: directUrl },
        stdio: 'pipe'
      });
      return { success: true, stdout: stdout.toString() };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        stdout: error.stdout ? error.stdout.toString() : null,
        stderr: error.stderr ? error.stderr.toString() : null
      };
    }
  }

  private static dbPushStatus: any = { status: 'idle' };

  @Post('db-push')
  async dbPush() {
    if (TenantsController.dbPushStatus.status === 'running') {
      return { message: 'Already running', status: TenantsController.dbPushStatus };
    }

    TenantsController.dbPushStatus = { status: 'running', startTime: new Date() };

    const { exec } = require('child_process');
    const dbUrl = process.env.DATABASE_URL || '';
    const directUrl = dbUrl.replace('-pooler', '').replace('&pgbouncer=true', '').replace('?pgbouncer=true', '');
    const env = { ...process.env, DIRECT_URL: directUrl };
    
    exec('npx prisma db push --accept-data-loss', { env }, (error: any, stdout: any, stderr: any) => {
      if (error) {
        TenantsController.dbPushStatus = {
          status: 'error',
          error: error.message,
          stdout,
          stderr,
          endTime: new Date()
        };
      } else {
        TenantsController.dbPushStatus = {
          status: 'success',
          stdout,
          stderr,
          endTime: new Date()
        };
      }
    });

    return { message: 'Database push started in background', status: TenantsController.dbPushStatus };
  }

  @Get('db-push-status')
  getDbPushStatus() {
    return TenantsController.dbPushStatus;
  }

  @Post('create-with-admin')
  async createTenantWithAdmin(@Body() body: { tenantName: string; adminEmail: string; adminPassword: string }) {
    return this.tenantsService.createTenantWithAdmin(body);
  }

  @Get(':tenantId/units')
  async getUnitsByTenant(@Param('tenantId') tenantId: string) {
    return this.tenantsService.getUnitsByTenant(tenantId);
  }

  @Post(':tenantId/units')
  async createUnitAndOwner(
    @Param('tenantId') tenantId: string,
    @Body() body: { unitNumber: string; ownerEmail: string; ownerPassword: string; aliquotPercentage: number }
  ) {
    return this.tenantsService.createUnitAndOwner(tenantId, body.unitNumber, body.ownerEmail, body.ownerPassword, body.aliquotPercentage);
  }

  @Delete(':tenantId/units/:unitId')
  async deleteUnit(
    @Param('tenantId') tenantId: string,
    @Param('unitId') unitId: string
  ) {
    return this.tenantsService.deleteUnit(tenantId, unitId);
  }
  @Get(':tenantId/stats')
  async getTenantStats(@Param('tenantId') tenantId: string) {
    return this.tenantsService.getTenantStats(tenantId);
  }

  @Get(':tenantId/reports/financial')
  async getFinancialReport(@Param('tenantId') tenantId: string) {
    return this.tenantsService.getFinancialReport(tenantId);
  }

  @Delete(':tenantId')
  async deleteTenant(@Param('tenantId') tenantId: string) {
    return this.tenantsService.deleteTenant(tenantId);
  }

  @Patch(':tenantId/toggle-status')
  async toggleTenantStatus(@Param('tenantId') tenantId: string) {
    return this.tenantsService.toggleTenantStatus(tenantId);
  }

  @Post(':tenantId/reset-admin-password')
  async resetAdminPassword(@Param('tenantId') tenantId: string) {
    return await this.tenantsService.resetAdminPassword(tenantId);
  }

  @Patch(':tenantId/logo')
  async updateTenantLogo(
    @Param('tenantId') tenantId: string,
    @Body() body: { logoBase64: string }
  ) {
    return this.tenantsService.updateTenantLogo(tenantId, body.logoBase64);
  }

  @Patch(':tenantId/settings')
  async updateTenantSettings(
    @Param('tenantId') tenantId: string,
    @Body() body: { rif?: string; address?: string; phone?: string; city?: string; state?: string; country?: string }
  ) {
    return this.tenantsService.updateTenantSettings(tenantId, body);
  }

  @Post(':tenantId/clear-finances')
  async clearFinances(@Param('tenantId') tenantId: string) {
    return this.tenantsService.clearFinances(tenantId);
  }



  @Post('reset-all-resident-passwords')
  async resetAllResidentPasswords() {
    return this.tenantsService.resetAllResidentPasswords();
  }

  @Get('debug-users')
  async debugUsers() {
    return this.tenantsService.debugUsers();
  }

  @Post('reactivate-all')
  async reactivateAllTenants() {
    return this.tenantsService.reactivateAllTenants();
  }
}
