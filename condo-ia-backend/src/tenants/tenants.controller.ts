import { Controller, Post, Body } from '@nestjs/common';
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
    }
  ) {
    return this.tenantsService.onboardTenant(body);
  }
}
