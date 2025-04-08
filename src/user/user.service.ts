/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
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
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { HashUtil } from 'src/utils/hash.util';
import { generateRandomString } from 'src/utils/generate-userid.util';
import { Wallet } from 'src/wallet/entities/wallet.entity';
import { generateOtp } from 'src/utils/generate-otp.util';
import { MailService } from 'src/utils/send-mail.util';
import { OtpDto } from './dto/otp-user.dto';

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
    user: ReturnType<User['toJSON']>;
  }> {
    try {
      const { email, phone, provider, providerId, password, referralId } =
        createUserDto;

      if (!password && (!provider || !providerId)) {
        throw new HttpException(
          {
            message: 'Either password or provider and provider ID is required',
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
            { message: 'Invalid referral ID' },
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

        throw new HttpException({ message }, HttpStatus.BAD_REQUEST);
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
        user: this.buildUserRO(user, false),
      };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new HttpException(
          { message: 'Email or phone already exists' },
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new InternalServerErrorException();
    }
  }

  async verifyOtp(otpDto: OtpDto): Promise<{
    message: string;
    status: number;
  }> {
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
        { message: 'OTP is invalid' },
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
    };
  }

  async findAll(): Promise<User[]> {
    return await this.userRepo.findAll({ populate: ['wallet'] });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepo.findOne(id, { populate: ['wallet'] });

    if (!user) {
      throw new HttpException(
        { message: 'User not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepo.findOne(id, { populate: ['wallet'] });

    if (!user) {
      throw new HttpException(
        { message: 'User not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    // Check if email is changing
    const isEmailChanging =
      updateUserDto.email && updateUserDto.email !== user.email;

    // Check if phone is changing
    const isPhoneChanging =
      updateUserDto.phone && updateUserDto.phone !== user.phone;

    // If email is changing, check if another user has it
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

    // If phone is changing, check if another user has it
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

    // Proceed with the update
    this.userRepo.assign(user, updateUserDto);
    this.em.persist(user);
    await this.em.flush();

    return user;
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
