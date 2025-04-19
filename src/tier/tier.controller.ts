import { Controller, Get, Param } from '@nestjs/common';
import { TierService } from './tier.service';

@Controller('tier')
export class TierController {
  constructor(private readonly tierService: TierService) {}

  @Get()
  findAll() {
    return this.tierService.findAll();
  }

  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.tierService.findOne(id);
  }
}
