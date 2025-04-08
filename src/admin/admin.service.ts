/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/admin/admin.service.ts
import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/mysql';
import { Admin } from './entities/admin.entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import { HashUtil } from 'src/utils/hash.util';
import { generateJWT } from 'src/utils/generateJWT';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepo: EntityRepository<Admin>,
    private readonly configService: ConfigService,
    private readonly em: EntityManager = adminRepo.getEntityManager(),
  ) {}

  async create(dto: CreateAdminDto): Promise<{
    status: number;
    message: string;
    data: Admin;
  }> {
    try {
      const existing = await this.adminRepo.findOne({ email: dto.email });

      if (existing) {
        throw new ConflictException('Admin with this email already exists');
      }

      const hashedPassword = await HashUtil.hashPassword(dto.password);
      dto.password = hashedPassword;
      const admin = this.adminRepo.create(dto);

      this.em.persist(admin);
      return {
        status: HttpStatus.CREATED,
        message: 'Admin Created Successfully',
        data: admin,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async validateAdmin(
    email: string,
    password: string,
  ): Promise<{
    message: string;
    token: string;
    status: number;
    data: ReturnType<Admin['toJSON']>;
  }> {
    const admin = await this.adminRepo.findOne({ email });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    const isMatch = await HashUtil.comparePassword(password, admin.password);
    if (!isMatch) {
      throw new UnauthorizedException('Password Incorrect');
    }

    return {
      data: admin.toJSON(),
      token: generateJWT({ id: admin.id, email: email }, this.configService),
      message: 'Login Successful',
      status: HttpStatus.OK,
    };
  }

  async findByEmail(email: string): Promise<Admin | null> {
    try {
      return await this.adminRepo.findOne({ email });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findById(id: string): Promise<{
    data: ReturnType<Admin['toJSON']>;
    status: number;
    message: string;
  }> {
    const admin = await this.adminRepo.findOne(id);
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }
    return {
      message: 'Admin found',
      status: HttpStatus.OK,
      data: admin.toJSON(),
    };
  }

  async findAll(): Promise<Admin[]> {
    try {
      return await this.adminRepo.findAll();
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
