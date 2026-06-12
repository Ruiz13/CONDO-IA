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
    return { version: 'bcryptjs-v4' };
  }

  @Post('db-push')
  async dbPush() {
    const { exec } = require('child_process');
    return new Promise((resolve) => {
      exec('DIRECT_URL="$DATABASE_URL" npx prisma db push', (error, stdout, stderr) => {
        resolve({
          error: error ? error.message : null,
          stdout,
          stderr
        });
      });
    });
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
    try {
      return await this.tenantsService.resetAdminPassword(tenantId);
    } catch (err: any) {
      return {
        debugError: true,
        message: err.message,
        stack: err.stack
      };
    }
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
