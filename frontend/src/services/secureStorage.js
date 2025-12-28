import { isWebView, sendMessageToApp } from '../utils/webview';

class SecureStorage {
  constructor() {
    this.pendingRequests = new Map();
    this.setupMessageListener();
  }

  setupMessageListener() {
    window.addEventListener('message', (event) => {
      try {
        const data = typeof event.data === 'string' 
          ? JSON.parse(event.data) 
          : event.data;
        
        if (data.type === 'SECURE_STORAGE_RESPONSE') {
          const { requestId, value, success } = data;
          const pending = this.pendingRequests.get(requestId);
          
          if (pending) {
            if (success) {
              pending.resolve(value);
            } else {
              pending.reject(new Error('Storage operation failed'));
            }
            this.pendingRequests.delete(requestId);
          }
        }
      } catch (e) {
        console.error('Erro ao processar resposta de storage:', e);
      }
    });
  }

  generateRequestId() {
    return `storage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async setItem(key, value) {
    if (isWebView()) {
      const requestId = this.generateRequestId();
      
      return new Promise((resolve, reject) => {
        this.pendingRequests.set(requestId, { resolve, reject });
        
        sendMessageToApp({
          type: 'SECURE_STORAGE_SET',
          requestId,
          key,
          value: typeof value === 'string' ? value : JSON.stringify(value)
        });
        
        setTimeout(() => {
          if (this.pendingRequests.has(requestId)) {
            this.pendingRequests.delete(requestId);
            reject(new Error('Storage timeout'));
          }
        }, 5000);
      });
    } else {
      try {
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    }
  }

  async getItem(key) {
    if (isWebView()) {
      const requestId = this.generateRequestId();
      
      return new Promise((resolve, reject) => {
        this.pendingRequests.set(requestId, { resolve, reject });
        
        sendMessageToApp({
          type: 'SECURE_STORAGE_GET',
          requestId,
          key
        });
        
        setTimeout(() => {
          if (this.pendingRequests.has(requestId)) {
            this.pendingRequests.delete(requestId);
            reject(new Error('Storage timeout'));
          }
        }, 5000);
      });
    } else {
      try {
        const value = localStorage.getItem(key);
        return Promise.resolve(value);
      } catch (error) {
        return Promise.reject(error);
      }
    }
  }

  async removeItem(key) {
    if (isWebView()) {
      const requestId = this.generateRequestId();
      
      return new Promise((resolve, reject) => {
        this.pendingRequests.set(requestId, { resolve, reject });
        
        sendMessageToApp({
          type: 'SECURE_STORAGE_REMOVE',
          requestId,
          key
        });
        
        setTimeout(() => {
          if (this.pendingRequests.has(requestId)) {
            this.pendingRequests.delete(requestId);
            reject(new Error('Storage timeout'));
          }
        }, 5000);
      });
    } else {
      try {
        localStorage.removeItem(key);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    }
  }

  async clear() {
    if (isWebView()) {
      const requestId = this.generateRequestId();
      
      return new Promise((resolve, reject) => {
        this.pendingRequests.set(requestId, { resolve, reject });
        
        sendMessageToApp({
          type: 'SECURE_STORAGE_CLEAR',
          requestId
        });
        
        setTimeout(() => {
          if (this.pendingRequests.has(requestId)) {
            this.pendingRequests.delete(requestId);
            reject(new Error('Storage timeout'));
          }
        }, 5000);
      });
    } else {
      try {
        localStorage.clear();
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    }
  }

  async setToken(token) {
    return this.setItem('auth_token', token);
  }

  async getToken() {
    return this.getItem('auth_token');
  }

  async removeToken() {
    return this.removeItem('auth_token');
  }

  async setUser(user) {
    return this.setItem('user_data', user);
  }

  async getUser() {
    const data = await this.getItem('user_data');
    return data ? JSON.parse(data) : null;
  }

  async removeUser() {
    return this.removeItem('user_data');
  }
}

export default new SecureStorage();
