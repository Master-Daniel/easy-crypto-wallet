/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // Create a notification
  @Post()
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.create(createNotificationDto);
  }

  // Get all notifications for a specific user
  @Get('user/:userId')
  findAllForUser(@Param('userId') userId: string) {
    return this.notificationService.findAllForUser(userId);
  }

  // Mark a notification as read
  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(id);
  }
}
