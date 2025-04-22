import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletTransferDto } from './dto/wallet-transfer.dto';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('/transfer')
  async transfer(
    @Body(new ValidationPipe()) walletTransferDto: WalletTransferDto,
  ): Promise<{
    message: string;
    status: number;
  }> {
    return await this.walletService.transfer(walletTransferDto);
  }
}
