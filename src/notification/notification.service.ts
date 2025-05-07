import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Notification } from './entites/notification.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/mysql';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: EntityRepository<Notification>,

    @InjectRepository(User)
    private readonly userRepo: EntityRepository<User>,

    private readonly em: EntityManager,
  ) {}

  async create(dto: CreateNotificationDto): Promise<Notification> {
    const user = await this.userRepo.findOne({ id: dto.userId });

    if (!user) {
      throw new NotFoundException(`User with ID ${dto.userId} not found`);
    }

    const notification = new Notification();
    notification.user = user;
    notification.title = dto.title;
    notification.message = dto.message;

    this.em.persist(notification);
    await this.em.flush();

    return notification;
  }

  async findAllForUser(userId: string): Promise<Notification[]> {
    const notifications = await this.notificationRepo.find(
      { user: userId },
      { orderBy: { createdAt: 'DESC' } },
    );
    return notifications;
  }

  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.notificationRepo.findOne({ id });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    notification.read = true;

    this.em.persist(notification);
    await this.em.flush();

    return notification;
  }
}
