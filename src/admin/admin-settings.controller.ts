import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  HttpStatus,
} from '@nestjs/common';
import { AdminSettingsService } from './admin-settings.service';

@Controller('admin-settings')
export class AdminSettingsController {
  constructor(private readonly adminSettingsService: AdminSettingsService) {}

  @Post()
  async create(@Body() settings: Record<string, string>) {
    return this.adminSettingsService.bulkUpsert(settings);
  }

  @Get()
  async findAll() {
    const settings = await this.adminSettingsService.findAll();
    return {
      status: HttpStatus.OK,
      data: settings,
    };
  }

  @Get(':key')
  async findOne(@Param('key') key: string) {
    const setting = await this.adminSettingsService.findByKey(key);
    return {
      status: HttpStatus.OK,
      data: setting,
    };
  }

  @Delete(':key')
  async remove(@Param('key') key: string) {
    return await this.adminSettingsService.delete(key);
  }
}
