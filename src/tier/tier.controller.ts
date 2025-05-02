import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { TierService } from './tier.service';
import { TierDto } from './dto/tier.dto';
import { Tier } from './entity/tier.entity';

@Controller('tier')
export class TierController {
  constructor(private readonly tierService: TierService) {}

  @Post('/create')
  create(
    @Body(new ValidationPipe()) tierDto: TierDto,
  ): Promise<{ message: string; status: number }> {
    return this.tierService.create(tierDto);
  }

  @Get()
  findAll(): Promise<{
    message: string;
    status: number;
    data: Tier[];
  }> {
    return this.tierService.findAll();
  }

  @Get('/:id')
  findOne(@Param('id') id: string): Promise<{
    message: string;
    status: number;
    data: Tier;
  }> {
    return this.tierService.findOne(id);
  }

  @Patch('update/:id')
  async updateTier(
    @Param('id') id: string,
    @Body() updateTierDto: Partial<TierDto>,
  ) {
    return this.tierService.patch(id, updateTierDto);
  }

  @Delete('delete/:id')
  async deleteTier(@Param('id') id: string) {
    return this.tierService.delete(id);
  }
}
