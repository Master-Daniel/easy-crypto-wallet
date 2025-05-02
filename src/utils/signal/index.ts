// src/common/utils/signal.utils.ts
import { Injectable } from '@nestjs/common';
import { Signals } from '../../signals/entities/signal.entity';

@Injectable()
export class SignalUtils {
  isSignalActive(signal: Signals): boolean {
    if (!signal || !signal.createdAt || !signal.duration) {
      return false;
    }

    const now = new Date();
    const durationValue = parseInt(signal.duration);
    const durationUnit = signal.duration.replace(/[0-9]/g, '').toLowerCase();
    const expirationDate = new Date(signal.createdAt);

    switch (durationUnit) {
      case 'h':
        expirationDate.setHours(expirationDate.getHours() + durationValue);
        break;
      case 'd':
        expirationDate.setDate(expirationDate.getDate() + durationValue);
        break;
      case 'w':
        expirationDate.setDate(expirationDate.getDate() + durationValue * 7);
        break;
      case 'mo':
        expirationDate.setMonth(expirationDate.getMonth() + durationValue);
        break;
      case 'min':
        expirationDate.setMinutes(expirationDate.getMinutes() + durationValue);
        break;
      case 's':
        expirationDate.setSeconds(expirationDate.getSeconds() + durationValue);
        break;
      default:
        expirationDate.setHours(expirationDate.getHours() + durationValue);
    }

    return now <= expirationDate;
  }
}
