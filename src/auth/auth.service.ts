import { EntityManager, EntityRepository } from '@mikro-orm/mysql';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { User } from '../user/entities/user.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { MailService } from 'src/utils/send-mail.util';
import { ConfigService } from '@nestjs/config';
import { ForgottenPasswordDto } from './dto/forgotten-password.dto';
import { generateOtp } from 'src/utils/generate-otp.util';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { HashUtil } from 'src/utils/hash.util';
import { OtpDto } from 'src/user/dto/otp-user.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @InjectRepository(User) private readonly userRepo: EntityRepository<User>,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly em: EntityManager = userRepo.getEntityManager(),
  ) {
    this.logger.log('AuthService Initialized');
  }

  async forgottenPassword(forgottenPasswordDto: ForgottenPasswordDto): Promise<{
    status: number;
    message: string;
  }> {
    const { email } = forgottenPasswordDto;

    const user = await this.userRepo.findOne({ email });
    if (!user) {
      throw new HttpException(
        { message: 'User not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    const otp = generateOtp(6);
    user.email_otp = otp;
    this.em.persist(user);
    await this.em.flush();

    await this.mailService.sendMail(
      email,
      email,
      otp,
      'password-request',
      'Password Reset Request',
    );

    return {
      status: HttpStatus.CREATED,
      message: `Password reset request otp sent to ${email}`,
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
    message: string;
    status: number;
  }> {
    const { otp, password, confirmPassword } = resetPasswordDto;

    if (password !== confirmPassword) {
      throw new HttpException(
        { message: 'Password do not match' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.userRepo.findOne({ email_otp: otp });

    if (!user) {
      throw new HttpException(
        { message: 'Invalid otp' },
        HttpStatus.BAD_REQUEST,
      );
    }

    user.password = await HashUtil.hashPassword(password);
    this.em.persist(user);
    await this.em.flush();

    return {
      message: 'Password reset successful',
      status: HttpStatus.OK,
    };
  }

  async verifyOtp(otpDto: OtpDto): Promise<{
    message: string;
    status: number;
  }> {
    const { email, otp } = otpDto;
    const user = await this.userRepo.findOne({ email: email, email_otp: otp });

    if (!user) {
      throw new HttpException(
        { message: 'Invalid otp' },
        HttpStatus.BAD_REQUEST,
      );
    }

    user.email_otp = '000000';
    this.em.persist(user);
    await this.em.flush();

    return {
      message: 'OTP verified Successfully',
      status: HttpStatus.OK,
    };
  }
}
