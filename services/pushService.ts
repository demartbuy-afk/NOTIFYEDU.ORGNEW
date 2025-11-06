// A VAPID public key is required to subscribe to push notifications.
// In a real application, this would be generated on your server and should not be hardcoded
// if your server keys change. For this demo, it's a constant.
const VAPID_PUBLIC_KEY = 'BF_gL3yT65U6zoh4cGFp22Y9-l0j45OT_k6aUwb23nTJbO9oHZzL0w1AsEcpoM-2D0A-u5G2kUco2_gY812_q2s';

/**
 * A helper function to convert the VAPID key from a URL-safe base64 string
 * to a Uint8Array, which is required by the push service.
 */
const urlBase64ToUint8Array = (base64String: string) => {  
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const pushService = {
  /**
   * Subscribes the user to push notifications.
   * @param studentId The ID of the student to associate the subscription with.
   */
  async subscribeUser(studentId: string) {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push messaging is not supported by this browser.');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (subscription === null) {
        // If not subscribed, request permission and create a new subscription.
        const permission = await window.Notification.requestPermission();
        if (permission !== 'granted') {
          console.warn('Permission for notifications was denied.');
          return;
        }

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true, // A notification must be shown when a push is received.
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });

        console.log('User is subscribed:', subscription);

        // In a real app, this subscription object would be sent to the backend server
        // and stored against the user's ID to send them notifications later.
        // For this demo, we'll store it in localStorage to simulate this.
        localStorage.setItem(`notifyedu_push_sub_${studentId}`, JSON.stringify(subscription));

      } else {
        console.log('User is already subscribed.');
        // Optionally, you could re-sync the subscription with the backend here.
        localStorage.setItem(`notifyedu_push_sub_${studentId}`, JSON.stringify(subscription));
      }
    } catch (error) {
      console.error('Failed to subscribe the user: ', error);
    }
  },
};
