export const isWebView = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const standalone = window.navigator.standalone;
  const isAndroid = /android/.test(userAgent);
  
  if (isAndroid && userAgent.includes('wv')) return true;
  if (window.Android && window.Android.postMessage) return true;
  if (standalone === true || standalone === false) return true;
  
  return false;
};

export const getOS = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  if (/android/.test(userAgent)) return 'android';
  if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
  return 'web';
};

export const sendMessageToApp = (message) => {
  try {
    if (window.Android && window.Android.postMessage) {
      window.Android.postMessage(JSON.stringify(message));
      return true;
    }
    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.bridge) {
      window.webkit.messageHandlers.bridge.postMessage(message);
      return true;
    }
    window.postMessage(JSON.stringify(message), '*');
    return true;
  } catch (error) {
    console.error('Erro ao enviar mensagem para o app:', error);
    return false;
  }
};

export const setupWebViewBridge = (handlers = {}) => {
  window.addEventListener('message', (event) => {
    try {
      let data;
      if (typeof event.data === 'string') {
        data = JSON.parse(event.data);
      } else {
        data = event.data;
      }
      
      if (data && data.type) {
        handleAppMessage(data, handlers);
      }
    } catch (e) {
      console.error('Erro ao processar mensagem do app:', e);
    }
  });
  
  sendMessageToApp({
    type: 'WEBVIEW_READY',
    timestamp: new Date().toISOString()
  });
};

const handleAppMessage = (data, customHandlers = {}) => {
  const { type, ...payload } = data;
  
  if (customHandlers[type]) {
    customHandlers[type](payload);
    return;
  }
  
  switch (type) {
    case 'THEME_CHANGED':
      handleThemeChange(payload);
      break;
    case 'PUSH_TOKEN':
      handlePushToken(payload);
      break;
    case 'NETWORK_STATUS':
      handleNetworkStatus(payload);
      break;
    case 'BACK_BUTTON':
      handleBackButton(payload);
      break;
    case 'APP_STATE':
      handleAppState(payload);
      break;
    case 'SECURE_STORAGE_RESPONSE':
      handleStorageResponse(payload);
      break;
    default:
      console.log('Mensagem não tratada:', type, payload);
  }
};

const handleThemeChange = ({ theme }) => {
  document.body.setAttribute('data-theme', theme);
  localStorage.setItem('app-theme', theme);
  window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
};

const handlePushToken = ({ token }) => {
  console.log('Token FCM recebido:', token);
  localStorage.setItem('push-token', token);
  
  const apiToken = localStorage.getItem('token');
  console.log('API Token presente:', !!apiToken);
  
  if (apiToken) {
    console.log('Registrando dispositivo no backend...');
    fetch(`${process.env.REACT_APP_API_URL || 'https://recaatinga.com.br/api'}/notifications/register-device`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiToken}`
      },
      body: JSON.stringify({ 
        deviceToken: token,
        platform: getOS()
      })
    })
    .then(res => res.json())
    .then(data => {
      console.log('Dispositivo registrado:', data);
    })
    .catch(err => {
      console.error('Erro ao registrar dispositivo:', err);
    });
  } else {
    console.log('Token não encontrado, aguardando login...');
  }
};

export const registerPushTokenIfAvailable = () => {
  const pushToken = localStorage.getItem('push-token');
  const apiToken = localStorage.getItem('token');
  
  console.log('Tentando registrar token:', { hasPushToken: !!pushToken, hasApiToken: !!apiToken });
  
  if (pushToken && apiToken) {
    console.log('Registrando token após login...');
    fetch(`${process.env.REACT_APP_API_URL || 'https://recaatinga.com.br/api'}/notifications/register-device`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiToken}`
      },
      body: JSON.stringify({ 
        deviceToken: pushToken,
        platform: getOS()
      })
    })
    .then(res => res.json())
    .then(data => {
      console.log('Dispositivo registrado após login:', data);
    })
    .catch(err => {
      console.error('Erro ao registrar após login:', err);
    });
  }
};

const handleNetworkStatus = ({ online }) => {
  window.dispatchEvent(new CustomEvent('networkStatusChanged', { 
    detail: { online } 
  }));
  
  if (!online) {
    showOfflineNotification();
  } else {
    removeOfflineNotification();
  }
};

const handleBackButton = () => {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    sendMessageToApp({ type: 'EXIT_APP' });
  }
};

const handleAppState = ({ state }) => {
  window.dispatchEvent(new CustomEvent('appStateChanged', { 
    detail: { state } 
  }));
  
  if (state === 'active') {
    window.dispatchEvent(new Event('resume'));
  } else if (state === 'background') {
    window.dispatchEvent(new Event('pause'));
  }
};

const handleStorageResponse = (payload) => {
  window.dispatchEvent(new CustomEvent('secureStorageResponse', { 
    detail: payload 
  }));
};

const showOfflineNotification = () => {
  if (document.querySelector('.offline-notification')) return;
  
  const notification = document.createElement('div');
  notification.className = 'offline-notification';
  notification.textContent = 'Você está offline';
  notification.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #ff9800;
    color: white;
    padding: 10px;
    text-align: center;
    z-index: 9999;
    font-size: 14px;
    animation: slideDown 0.3s ease;
  `;
  
  document.body.prepend(notification);
};

const removeOfflineNotification = () => {
  const notification = document.querySelector('.offline-notification');
  if (notification) {
    notification.remove();
  }
};

export const openExternalLink = (url) => {
  if (isWebView()) {
    sendMessageToApp({
      type: 'OPEN_EXTERNAL_LINK',
      url
    });
  } else {
    window.open(url, '_blank');
  }
};

export const shareContent = async (data) => {
  if (isWebView()) {
    sendMessageToApp({
      type: 'SHARE',
      ...data
    });
  } else if (navigator.share) {
    try {
      await navigator.share(data);
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  }
};

export const requestPermission = (permission) => {
  return new Promise((resolve) => {
    if (isWebView()) {
      sendMessageToApp({
        type: 'REQUEST_PERMISSION',
        permission
      });
      
      const handler = (event) => {
        try {
          const data = typeof event.data === 'string' 
            ? JSON.parse(event.data) 
            : event.data;
            
          if (data.type === 'PERMISSION_RESULT' && data.permission === permission) {
            window.removeEventListener('message', handler);
            resolve(data.granted);
          }
        } catch (e) {
          console.error('Erro ao processar resposta de permissão:', e);
        }
      };
      
      window.addEventListener('message', handler);
      
      setTimeout(() => {
        window.removeEventListener('message', handler);
        resolve(false);
      }, 10000);
    } else {
      resolve(true);
    }
  });
};

export const vibrate = (pattern = 100) => {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  } else if (isWebView()) {
    sendMessageToApp({
      type: 'VIBRATE',
      pattern
    });
  }
};

export const setStatusBarColor = (color, style = 'dark') => {
  if (isWebView()) {
    sendMessageToApp({
      type: 'STATUS_BAR',
      color,
      style
    });
  }
};

export const showToast = (message, duration = 'short') => {
  if (isWebView()) {
    sendMessageToApp({
      type: 'SHOW_TOAST',
      message,
      duration
    });
  }
};

export const logEvent = (eventName, params = {}) => {
  if (isWebView()) {
    sendMessageToApp({
      type: 'LOG_EVENT',
      eventName,
      params
    });
  }
};

export default {
  isWebView,
  getOS,
  sendMessageToApp,
  setupWebViewBridge,
  openExternalLink,
  shareContent,
  requestPermission,
  vibrate,
  setStatusBarColor,
  showToast,
  logEvent,
  registerPushTokenIfAvailable
};