import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createNotification = async (recipientId: string, type: string, channel: string, payload: any) => {
  return prisma.notification.create({
    data: {
      recipientId,
      type: type as any,
      channel: channel as any,
      payload,
      sentAt: null,
    },
  });
};

export const listNotificationsForUser = async (userId: string) => {
  return prisma.notification.findMany({ where: { recipientId: userId }, orderBy: { createdAt: 'desc' } });
};

export const markNotificationRead = async (id: string) => {
  return prisma.notification.update({ where: { id }, data: { readAt: new Date() } });
};
