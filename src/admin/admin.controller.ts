import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { Admin } from './entities/admin.entity';
// You can use an AdminAuthGuard if you've implemented one
// import { AdminAuthGuard } from './guards/admin-auth.guard';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateAdminDto): Promise<{
    message: string;
    status: number;
    data: Admin;
  }> {
    return this.adminService.create(dto);
  }

  @Post('login')
  async validateAdmin(@Body() dto: CreateAdminDto): Promise<{
    message: string;
    token: string;
    status: number;
    data: ReturnType<Admin['toJSON']>;
  }> {
    return this.adminService.validateAdmin(dto.email, dto.password);
  }

  @Get()
  // @UseGuards(AdminAuthGuard) // Optional: secure this route
  async findAll(): Promise<Admin[]> {
    return this.adminService.findAll();
  }

  @Get(':id')
  // @UseGuards(AdminAuthGuard)
  async findOne(@Param('id') id: string): Promise<{
    data: ReturnType<Admin['toJSON']>;
    message: string;
    status: number;
  }> {
    return this.adminService.findById(id);
  }
}
