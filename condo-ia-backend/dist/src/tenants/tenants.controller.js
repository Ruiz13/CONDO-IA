"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TenantsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantsController = void 0;
const common_1 = require("@nestjs/common");
const tenants_service_1 = require("./tenants.service");
let TenantsController = class TenantsController {
    static { TenantsController_1 = this; }
    tenantsService;
    constructor(tenantsService) {
        this.tenantsService = tenantsService;
    }
    async onboardTenant(body) {
        return this.tenantsService.onboardTenant(body);
    }
    async getAllTenants() {
        return this.tenantsService.getAllTenants();
    }
    version() {
        return { version: 'bcryptjs-v5' };
    }
    static dbPushStatus = { status: 'idle' };
    async dbPush() {
        if (TenantsController_1.dbPushStatus.status === 'running') {
            return { message: 'Already running', status: TenantsController_1.dbPushStatus };
        }
        TenantsController_1.dbPushStatus = { status: 'running', startTime: new Date() };
        const { exec } = require('child_process');
        exec('DIRECT_URL="$DATABASE_URL" npx prisma db push', (error, stdout, stderr) => {
            if (error) {
                TenantsController_1.dbPushStatus = {
                    status: 'error',
                    error: error.message,
                    stdout,
                    stderr,
                    endTime: new Date()
                };
            }
            else {
                TenantsController_1.dbPushStatus = {
                    status: 'success',
                    stdout,
                    stderr,
                    endTime: new Date()
                };
            }
        });
        return { message: 'Database push started in background', status: TenantsController_1.dbPushStatus };
    }
    getDbPushStatus() {
        return TenantsController_1.dbPushStatus;
    }
    async createTenantWithAdmin(body) {
        return this.tenantsService.createTenantWithAdmin(body);
    }
    async getUnitsByTenant(tenantId) {
        return this.tenantsService.getUnitsByTenant(tenantId);
    }
    async createUnitAndOwner(tenantId, body) {
        return this.tenantsService.createUnitAndOwner(tenantId, body.unitNumber, body.ownerEmail, body.ownerPassword, body.aliquotPercentage);
    }
    async deleteUnit(tenantId, unitId) {
        return this.tenantsService.deleteUnit(tenantId, unitId);
    }
    async getTenantStats(tenantId) {
        return this.tenantsService.getTenantStats(tenantId);
    }
    async getFinancialReport(tenantId) {
        return this.tenantsService.getFinancialReport(tenantId);
    }
    async deleteTenant(tenantId) {
        return this.tenantsService.deleteTenant(tenantId);
    }
    async toggleTenantStatus(tenantId) {
        return this.tenantsService.toggleTenantStatus(tenantId);
    }
    async resetAdminPassword(tenantId) {
        try {
            return await this.tenantsService.resetAdminPassword(tenantId);
        }
        catch (err) {
            return {
                debugError: true,
                message: err.message,
                stack: err.stack
            };
        }
    }
    async updateTenantLogo(tenantId, body) {
        return this.tenantsService.updateTenantLogo(tenantId, body.logoBase64);
    }
    async updateTenantSettings(tenantId, body) {
        return this.tenantsService.updateTenantSettings(tenantId, body);
    }
    async clearFinances(tenantId) {
        return this.tenantsService.clearFinances(tenantId);
    }
    async resetAllResidentPasswords() {
        return this.tenantsService.resetAllResidentPasswords();
    }
    async debugUsers() {
        return this.tenantsService.debugUsers();
    }
    async reactivateAllTenants() {
        return this.tenantsService.reactivateAllTenants();
    }
};
exports.TenantsController = TenantsController;
__decorate([
    (0, common_1.Post)('onboard'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "onboardTenant", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "getAllTenants", null);
__decorate([
    (0, common_1.Get)('version'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "version", null);
__decorate([
    (0, common_1.Post)('db-push'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "dbPush", null);
__decorate([
    (0, common_1.Get)('db-push-status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "getDbPushStatus", null);
__decorate([
    (0, common_1.Post)('create-with-admin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "createTenantWithAdmin", null);
__decorate([
    (0, common_1.Get)(':tenantId/units'),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "getUnitsByTenant", null);
__decorate([
    (0, common_1.Post)(':tenantId/units'),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "createUnitAndOwner", null);
__decorate([
    (0, common_1.Delete)(':tenantId/units/:unitId'),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Param)('unitId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "deleteUnit", null);
__decorate([
    (0, common_1.Get)(':tenantId/stats'),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "getTenantStats", null);
__decorate([
    (0, common_1.Get)(':tenantId/reports/financial'),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "getFinancialReport", null);
__decorate([
    (0, common_1.Delete)(':tenantId'),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "deleteTenant", null);
__decorate([
    (0, common_1.Patch)(':tenantId/toggle-status'),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "toggleTenantStatus", null);
__decorate([
    (0, common_1.Post)(':tenantId/reset-admin-password'),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "resetAdminPassword", null);
__decorate([
    (0, common_1.Patch)(':tenantId/logo'),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "updateTenantLogo", null);
__decorate([
    (0, common_1.Patch)(':tenantId/settings'),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "updateTenantSettings", null);
__decorate([
    (0, common_1.Post)(':tenantId/clear-finances'),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "clearFinances", null);
__decorate([
    (0, common_1.Post)('reset-all-resident-passwords'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "resetAllResidentPasswords", null);
__decorate([
    (0, common_1.Get)('debug-users'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "debugUsers", null);
__decorate([
    (0, common_1.Post)('reactivate-all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "reactivateAllTenants", null);
exports.TenantsController = TenantsController = TenantsController_1 = __decorate([
    (0, common_1.Controller)('api/tenants'),
    __metadata("design:paramtypes", [tenants_service_1.TenantsService])
], TenantsController);
//# sourceMappingURL=tenants.controller.js.map