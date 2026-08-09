const DEFAULT_NOTIFICATIONS = [
  {
    id: 'ann-1',
    title: 'Scheduled Road Closure - Main St',
    message: 'Main Street between 4th Ave and 7th Ave will be closed for asphalt repaving from July 22, 10 PM to July 23, 6 AM. Detours are marked.',
    type: 'warning',
    targetAudience: 'all',
    createdAt: '2026-07-20T08:00:00.000Z'
  },
  {
    id: 'ann-2',
    title: 'Extreme Heat Warning',
    message: 'Temperatures are expected to exceed 100°F tomorrow. Public cooling shelters will be open at the Civic Center and Greenwood Library from 9 AM to 8 PM.',
    type: 'alert',
    targetAudience: 'citizens',
    createdAt: '2026-07-19T15:30:00.000Z'
  },
  {
    id: 'ann-3',
    title: 'Free Municipal Yoga in the Park',
    message: 'Join us for free community yoga sessions every Saturday morning at Greenwood Park Central Lawn. Bring your own mat. Starts at 7:30 AM.',
    type: 'info',
    targetAudience: 'all',
    createdAt: '2026-07-15T12:00:00.000Z'
  }
];

const getAnnouncementsFromStorage = () => {
  const list = localStorage.getItem('cc_notifications');
  if (!list) {
    localStorage.setItem('cc_notifications', JSON.stringify(DEFAULT_NOTIFICATIONS));
    return DEFAULT_NOTIFICATIONS;
  }
  return JSON.parse(list);
};

export const notificationService = {
  getNotifications: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      success: true,
      message: 'Announcements loaded.',
      data: getAnnouncementsFromStorage()
    };
  },

  createNotification: async (data) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const list = getAnnouncementsFromStorage();
    const newAnn = {
      ...data,
      id: `ann-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString()
    };
    list.unshift(newAnn);
    localStorage.setItem('cc_notifications', JSON.stringify(list));
    return {
      success: true,
      message: 'Announcement broadcasted.',
      data: newAnn
    };
  },

  updateNotification: async (id, data) => {
    await new Promise((resolve) => setTimeout(resolve, 450));
    const list = getAnnouncementsFromStorage();
    const idx = list.findIndex((a) => a.id === id);
    if (idx === -1) return { success: false, message: 'Announcement not found.' };
    const updated = { ...list[idx], ...data };
    list[idx] = updated;
    localStorage.setItem('cc_notifications', JSON.stringify(list));
    return {
      success: true,
      message: 'Announcement updated.',
      data: updated
    };
  },

  deleteNotification: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const list = getAnnouncementsFromStorage();
    const filtered = list.filter((a) => a.id !== id);
    localStorage.setItem('cc_notifications', JSON.stringify(filtered));
    return {
      success: true,
      message: 'Announcement retracted successfully.',
      data: null
    };
  }
};
