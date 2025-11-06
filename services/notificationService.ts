
export type NotificationEventType = 'attendance' | 'announcement' | 'complaint' | 'message';

export interface NotificationSettings {
    attendance: boolean;
    announcement: boolean;
    complaint: boolean;
    message: boolean;
}

const NOTIFICATION_SETTINGS_KEY = 'notifyedu_notification_settings';

/**
 * A service to handle browser notifications.
 */
export const notificationService = {
  /**
   * Retrieves notification settings from localStorage.
   * @returns {NotificationSettings} The current settings, with defaults if not set.
   */
  getSettings(): NotificationSettings {
    const defaults: NotificationSettings = {
        attendance: true,
        announcement: true,
        complaint: true,
        message: true,
    };
    try {
        const stored = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
        if (stored) {
            return { ...defaults, ...JSON.parse(stored) };
        }
    } catch (e) {
        console.error("Failed to parse notification settings from localStorage", e);
    }
    return defaults;
  },

  /**
   * Saves notification settings to localStorage.
   * @param {NotificationSettings} settings - The settings object to save.
   */
  saveSettings(settings: NotificationSettings) {
    try {
        localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
        console.error("Failed to save notification settings to localStorage", e);
    }
  },

  /**
   * Requests permission from the user to show notifications.
   * It checks for browser support first.
   * @returns {Promise<NotificationPermission>} The permission status ('granted', 'denied', or 'default').
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.error('This browser does not support desktop notification');
      return 'denied';
    }
    // Don't request permission if it's already denied.
    if (Notification.permission === 'denied') {
        return 'denied';
    }
    return Notification.requestPermission();
  },

  /**
   * Shows a notification if permission is granted and the event type is enabled in settings.
   * This is enhanced to use the service worker if the tab is in the background.
   * @param {string} title - The title of the notification.
   * @param {NotificationOptions} [options] - Optional settings for the notification (e.g., body, icon).
   * @param {NotificationEventType} eventType - The type of event triggering the notification.
   */
  async show(title: string, options?: NotificationOptions, eventType?: NotificationEventType): Promise<void> {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      console.error('This browser does not support notifications.');
      return;
    }

    if (eventType) {
        const settings = this.getSettings();
        if (!settings[eventType]) {
            return; // Do not show notification if this type is disabled
        }
    }
    
    const permission = await this.requestPermission();
    if (permission !== 'granted') {
        return;
    }

    // If the tab is hidden, or service worker is ready, try to send a message to it
    // to display the notification from the background.
    const registration = await navigator.serviceWorker.ready;
    if (document.hidden && registration && registration.active) {
        registration.active.postMessage({
            type: 'SHOW_NOTIFICATION',
            payload: { title, ...options }
        });
    } else {
      // If the tab is visible, show a standard notification.
      new Notification(title, options);
    }
  },
};