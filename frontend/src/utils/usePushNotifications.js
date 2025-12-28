import { useEffect, useState } from 'react';
import { isWebView, setupWebViewBridge, registerPushTokenIfAvailable } from '../utils/webview';
import { notificationAPI } from '../services/api';

export const usePushNotifications = () => {
  const [token, setToken] = useState(null);
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    initializePushNotifications();
  }, []);

  const initializePushNotifications = async () => {
    if (isWebView()) {
      setupWebViewBridge({
        PUSH_TOKEN: handlePushToken,
        PUSH_NOTIFICATION_RECEIVED: handleNotificationReceived,
        NOTIFICATION_OPENED: handleNotificationOpened
      });

      registerPushTokenIfAvailable();
    } else {
      await requestWebPushPermission();
    }
  };

  const handlePushToken = async ({ token: deviceToken, platform }) => {
    setToken(deviceToken);
    
    try {
      const apiToken = localStorage.getItem('token');
      if (apiToken) {
        await notificationAPI.registerDevice({
          deviceToken,
          platform: platform || 'web'
        });
        console.log('Dispositivo registrado com sucesso');
      }
    } catch (error) {
      console.error('Erro ao registrar dispositivo:', error);
    }
  };

  const handleNotificationReceived = (notification) => {
    console.log('Notificação recebida:', notification);
    
    window.dispatchEvent(new CustomEvent('pushNotificationReceived', {
      detail: notification
    }));
  };

  const handleNotificationOpened = (notification) => {
    console.log('Notificação aberta:', notification);
    
    const type = notification.data?.type;
    
    switch(type) {
      case 'task_review':
        window.location.href = '/dashboard';
        break;
      case 'phase_unlocked':
        window.location.href = '/phases';
        break;
      case 'achievement':
        window.location.href = '/achievements';
        break;
      case 'ranking':
        window.location.href = '/ranking';
        break;
      default:
        window.location.href = '/dashboard';
    }
  };

  const requestWebPushPermission = async () => {
    if (!('Notification' in window)) {
      console.log('Navegador não suporta notificações');
      return;
    }

    const currentPermission = Notification.permission;
    setPermission(currentPermission);

    if (currentPermission === 'default') {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        console.log('Permissão de notificação concedida');
      }
    }
  };

  const showLocalNotification = (title, options = {}) => {
    if (!('Notification' in window)) {
      console.log('Navegador não suporta notificações');
      return;
    }

    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/logo192.png',
        badge: '/logo192.png',
        ...options
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
        
        if (options.data?.url) {
          window.location.href = options.data.url;
        }
      };

      return notification;
    }
  };

  const unregisterDevice = async () => {
    try {
      if (token) {
        await notificationAPI.removeDevice({ deviceToken: token });
        setToken(null);
        console.log('Dispositivo removido com sucesso');
      }
    } catch (error) {
      console.error('Erro ao remover dispositivo:', error);
    }
  };

  return {
    token,
    permission,
    requestWebPushPermission,
    showLocalNotification,
    unregisterDevice,
    isSupported: 'Notification' in window || isWebView()
  };
};

export default usePushNotifications;
