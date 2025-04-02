import { EntityRepository } from '@mikro-orm/mysql';
import { User } from '../user/entities/user.entity';

export const generateRandomString = async (
  userRepo: EntityRepository<User>,
): Promise<string> => {
  const digits = '0123456789';
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let userId: string;
  let exists: User | null;

  const randomDigits = (length: number) =>
    Array.from(
      { length },
      () => digits[Math.floor(Math.random() * digits.length)],
    ).join('');

  const randomLetters = (length: number) =>
    Array.from(
      { length },
      () => letters[Math.floor(Math.random() * letters.length)],
    ).join('');

  do {
    userId = `${randomDigits(4)}${randomLetters(6)}${randomDigits(2)}`; // Generate user_id
    exists = await userRepo.findOne({ user_id: userId }); // Check if it already exists
  } while (exists); // Repeat if user_id exists

  return userId;
};
