/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { EntityManager, EntityRepository } from '@mikro-orm/mysql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ConfigService } from '@nestjs/config';
import { HashUtil } from '../utils/hash.util';
import { generateRandomString } from '../utils/generate-userid.util';
import { Wallet } from '../wallet/entities/wallet.entity';
import { generateOtp } from '../utils/generate-otp.util';
import { MailService } from '../utils/send-mail.util';
import { OtpDto } from './dto/otp-user.dto';
import { generateJWT } from '../utils/generateJWT';
import { LoginUserDto } from './dto/login-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(User) private readonly userRepo: EntityRepository<User>,
    @InjectRepository(Wallet)
    private readonly walletRepo: EntityRepository<Wallet>,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly em: EntityManager = userRepo.getEntityManager(),
  ) {
    this.logger.log('UsersService Initialized');
  }

  async create(createUserDto: CreateUserDto): Promise<{
    message: string;
    status: number;
    data: ReturnType<User['toJSON']>;
  }> {
    const { email, phone, provider, providerId, password, referralId } =
      createUserDto;

    if (!password && (!provider || !providerId)) {
      throw new HttpException(
        {
          message: 'Either password or provider and provider ID is required',
          status: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (referralId) {
      const referralExists = await this.userRepo.findOne({
        user_id: referralId,
      });

      if (!referralExists) {
        throw new HttpException(
          { message: 'Invalid referral ID', status: HttpStatus.BAD_REQUEST },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // Check if the user already exists
    const userExist = await this.userRepo.findOne({
      $or: [{ phone }, { email }],
    });

    if (userExist) {
      let message = 'User already exists';

      if (userExist.email === email) {
        message = 'Email address already exists';
      } else if (userExist.phone === phone) {
        message = 'Phone number already exists';
      }

      throw new HttpException(
        { message, status: HttpStatus.BAD_REQUEST },
        HttpStatus.BAD_REQUEST,
      );
    }

    const otp = generateOtp(6);

    // Hash the password if it exists
    if (password) {
      createUserDto.password = await HashUtil.hashPassword(password);
    }

    // Generate a unique user ID
    createUserDto.user_id = await generateRandomString(this.userRepo);

    // Step 1: Create the user
    const user = this.userRepo.create(createUserDto);
    this.em.persist(user);
    await this.em.flush(); // Save user first to generate ID

    // Step 2: Create the wallet for the user
    const wallet = new Wallet();
    this.walletRepo.assign(wallet, { user }); // Associate user with wallet
    this.em.persist(wallet);
    await this.em.flush(); // Save wallet to generate ID

    // Step 3: Update the user with the wallet ID
    user.wallet = wallet;
    user.email_otp = otp;
    this.em.persist(user);
    await this.em.flush(); // Final save

    if (password) {
      await this.mailService.sendMail(
        email,
        email,
        otp,
        'welcome',
        'Email Verification',
      );
    }

    return {
      status: HttpStatus.CREATED,
      message:
        'Account created successfully. Check your email for account verification',
      data: user.toJSON(),
    };
  }

  async login(loginUserDto: LoginUserDto): Promise<{
    message: string;
    status: number;
    token: string;
    data: ReturnType<User['toJSON']>;
  }> {
    const { email, password } = loginUserDto;

    const user = await this.userRepo.findOne(
      { email },
      { populate: ['wallet', 'kyc_status'] },
    );

    if (!user) {
      throw new HttpException(
        { message: 'User not found', status: HttpStatus.NOT_FOUND },
        HttpStatus.NOT_FOUND,
      );
    }

    if (!user.email_verified) {
      throw new HttpException(
        { message: 'Email not verified', status: HttpStatus.BAD_REQUEST },
        HttpStatus.BAD_REQUEST,
      );
    }

    const isPasswordValid = await HashUtil.comparePassword(
      password,
      user.password || '',
    );

    if (!isPasswordValid) {
      throw new HttpException(
        { message: 'Invalid credentials', status: HttpStatus.UNAUTHORIZED },
        HttpStatus.UNAUTHORIZED,
      );
    }

    return {
      status: HttpStatus.OK,
      message: 'Login successful',
      data: user.toJSON(),
      token: generateJWT({ id: user.id, email: email }, this.configService),
    };
  }

  async verifyOtp(
    otpDto: OtpDto,
  ): Promise<{ message: string; status: number; token: string }> {
    const { email, otp } = otpDto;
    const user = await this.userRepo.findOne({ email });

    if (!user) {
      throw new HttpException(
        { message: 'User not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    if (user.email_otp !== otp) {
      throw new HttpException(
        { message: 'OTP is invalid', status: HttpStatus.NOT_FOUND },
        HttpStatus.NOT_FOUND,
      );
    }

    user.email_verified = true;
    user.email_otp = '000000';
    this.em.persist(user);
    await this.em.flush();

    return {
      message: 'OTP verification successful',
      status: HttpStatus.OK,
      token: generateJWT({ id: user.id, email: email }, this.configService),
    };
  }

  async resendOtp(resendOtpDto: ResendOtpDto): Promise<{
    message: string;
    status: number;
  }> {
    const { email } = resendOtpDto;
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
      'welcome',
      'Email Verification',
    );

    return {
      message: 'OTP resent successfully',
      status: HttpStatus.OK,
    };
  }

  async forgotPassword(resendOtpDto: ResendOtpDto): Promise<{
    message: string;
    status: number;
  }> {
    const { email } = resendOtpDto;
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
      'Password Reset',
    );
    return {
      message: 'Password reset OTP sent successfully',
      status: HttpStatus.OK,
    };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string; status: number }> {
    const { newPassword, confirmNewPassword, otp } = resetPasswordDto;
    const user = await this.userRepo.findOne({ email_otp: otp });
    if (newPassword !== confirmNewPassword) {
      throw new HttpException(
        { message: 'Passwords do not match' },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (newPassword.length < 8) {
      throw new HttpException(
        { message: 'Password must be at least 8 characters long' },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!user) {
      throw new HttpException(
        { message: 'User not found' },
        HttpStatus.NOT_FOUND,
      );
    }
    user.password = await HashUtil.hashPassword(newPassword);
    user.email_verified = true;
    user.email_otp = '000000';
    this.em.persist(user);
    await this.em.flush();
    return {
      message: 'Password reset successful',
      status: HttpStatus.OK,
    };
  }

  async findAll(): Promise<User[]> {
    try {
      return await this.userRepo.findAll({ populate: ['wallet'] });
    } catch (error) {
      this.logger.error(
        `Error fetching all users: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(error.message);
    }
  }

  async findOne(id: string): Promise<User> {
    try {
      const user = await this.userRepo.findOne(id, { populate: ['wallet'] });

      if (!user) {
        throw new HttpException(
          { message: 'User not found' },
          HttpStatus.NOT_FOUND,
        );
      }

      return user;
    } catch (error) {
      this.logger.error(
        `Error finding user by ID: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const user = await this.userRepo.findOne(id, { populate: ['wallet'] });

      if (!user) {
        throw new HttpException(
          { message: 'User not found' },
          HttpStatus.NOT_FOUND,
        );
      }

      const isEmailChanging =
        updateUserDto.email && updateUserDto.email !== user.email;
      const isPhoneChanging =
        updateUserDto.phone && updateUserDto.phone !== user.phone;

      if (isEmailChanging) {
        const emailExists = await this.userRepo.findOne({
          email: updateUserDto.email,
          id: { $ne: id },
        });
        if (emailExists) {
          throw new HttpException(
            { message: 'Email address is already in use.' },
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      if (isPhoneChanging) {
        const phoneExists = await this.userRepo.findOne({
          phone: updateUserDto.phone,
          id: { $ne: id },
        });
        if (phoneExists) {
          throw new HttpException(
            { message: 'Phone number is already in use.' },
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      this.userRepo.assign(user, updateUserDto);
      this.em.persist(user);
      await this.em.flush();

      return user;
    } catch (error) {
      this.logger.error(`Error updating user: ${error.message}`, error.stack);
      throw new InternalServerErrorException(error.message);
    }
  }

  async remove(id: string): Promise<{ status: number; message: string }> {
    try {
      const user = await this.userRepo.findOne(id);
      if (!user) {
        throw new HttpException(
          { message: 'User not found' },
          HttpStatus.NOT_FOUND,
        );
      }
      await this.em.removeAndFlush(user);
      return {
        status: HttpStatus.OK,
        message: 'User deleted successfully',
      };
    } catch (error) {
      this.logger.error(`Error removing user: ${error.message}`, error.stack);
      throw new InternalServerErrorException(error.message);
    }
  }
}
