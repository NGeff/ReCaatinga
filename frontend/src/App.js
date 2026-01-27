import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { isWebView, setupWebViewBridge, setStatusBarColor, logEvent } from './utils/webview';
import secureStorage from './services/secureStorage';

import Landing from './pages/Landing';
import About from './pages/About';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Login from './pages/Login';
import Register from './pages/Register';
import Verify from './pages/Verify';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Phases from './pages/Phases';
import PhaseDetail from './pages/PhaseDetail';
import MissionDetail from './pages/MissionDetail';
import GamePlay from './pages/GamePlay';
import TaskSubmit from './pages/TaskSubmit';
import FormSubmit from './pages/FormSubmit';
import TextSubmit from './pages/TextSubmit';
import Ranking from './pages/Ranking';
import Profile from './pages/Profile';
import Achievements from './pages/Achievements';
import NotificationSettings from './pages/NotificationSettings';
import MobileMenu from './components/MobileMenu';
import AdminPanel from './pages/AdminPanel';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminNotifications from './pages/AdminNotifications';
import ContentManager from './pages/ContentManager';
import CreatePhase from './pages/CreatePhase';
import CreateMission from './pages/CreateMission';
import CreateGame from './pages/CreateGame';
import EditPhase from './pages/EditPhase';
import EditMission from './pages/EditMission';
import EditGame from './pages/EditGame';
import EditGameContent from './pages/EditGameContent';
import ManagePhases from './pages/ManagePhases';
import TaskReview from './pages/TaskReview';
import CreateAchievement from './pages/CreateAchievement';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';

import './App.css';

function App() {
  const [isAppReady, setIsAppReady] = useState(!isWebView());
  const [networkStatus, setNetworkStatus] = useState(navigator.onLine);

  useEffect(() => {
    const inWebView = isWebView();
    
    if (inWebView) {
      document.body.classList.add('webview-mode');
      
      setupWebViewBridge({
        WEBVIEW_INITIALIZED: () => {
          setIsAppReady(true);
        },
        NETWORK_STATUS: ({ online }) => {
          setNetworkStatus(online);
        }
      });
      
      setStatusBarColor('#2d5016', 'light');
      logEvent('app_opened', {
        timestamp: new Date().toISOString(),
        platform: 'android'
      });
      
      setTimeout(() => {
        if (!isAppReady) {
          setIsAppReady(true);
        }
      }, 2000);
    }
    
    const handleOnline = () => setNetworkStatus(true);
    const handleOffline = () => setNetworkStatus(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (inWebView) {
        document.body.classList.remove('webview-mode');
      }
    };
  }, [isAppReady]);

  useEffect(() => {
    if (!isWebView()) return;
    
    const handleBackButton = (e) => {
      const currentPath = window.location.pathname;
      
      if (currentPath === '/' || currentPath === '/dashboard') {
        e.preventDefault();
        if (window.confirm('Deseja sair do aplicativo?')) {
          window.history.back();
        }
      }
    };
    
    window.addEventListener('backbutton', handleBackButton);
    
    return () => {
      window.removeEventListener('backbutton', handleBackButton);
    };
  }, []);

  useEffect(() => {
    if (!isWebView()) return;
    
    const handleResume = async () => {
      logEvent('app_resumed');
      
      try {
        const token = await secureStorage.getToken();
        if (token) {
        }
      } catch (error) {
        console.error('Erro ao validar token:', error);
      }
    };
    
    const handlePause = () => {
      logEvent('app_paused');
    };
    
    window.addEventListener('resume', handleResume);
    window.addEventListener('pause', handlePause);
    
    return () => {
      window.removeEventListener('resume', handleResume);
      window.removeEventListener('pause', handlePause);
    };
  }, []);

  if (!isAppReady) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  const NetworkIndicator = () => {
    if (networkStatus) return null;
    
    return (
      <div className="network-indicator offline">
        <span>⚠️</span> Você está offline
      </div>
    );
  };

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <NetworkIndicator />
          
          <Routes>
            <Route path="/" element={
              <GuestRoute>
                <Landing />
              </GuestRoute>
            } />
            
            <Route path="/about" element={<About />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            
            <Route path="/login" element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            } />
            
            <Route path="/register" element={
              <GuestRoute>
                <Register />
              </GuestRoute>
            } />
            
            <Route path="/verify" element={<Verify />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            
            <Route path="/menu" element={
              <ProtectedRoute>
                <MobileMenu />
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/phases" element={
              <ProtectedRoute>
                <Phases />
              </ProtectedRoute>
            } />
            
            <Route path="/phase/:id" element={
              <ProtectedRoute>
                <PhaseDetail />
              </ProtectedRoute>
            } />
            
            <Route path="/mission/:id" element={
              <ProtectedRoute>
                <MissionDetail />
              </ProtectedRoute>
            } />
            
            <Route path="/game/:id" element={
              <ProtectedRoute>
                <GamePlay />
              </ProtectedRoute>
            } />
            
            <Route path="/task-submit/:missionId" element={
              <ProtectedRoute>
                <TaskSubmit />
              </ProtectedRoute>
            } />
            
            <Route path="/form-submit/:missionId" element={
              <ProtectedRoute>
                <FormSubmit />
              </ProtectedRoute>
            } />
            
            <Route path="/text-submit/:missionId" element={
              <ProtectedRoute>
                <TextSubmit />
              </ProtectedRoute>
            } />
            
            <Route path="/ranking" element={
              <ProtectedRoute>
                <Ranking />
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            
            <Route path="/profile/:userId" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            
            <Route path="/achievements" element={
              <ProtectedRoute>
                <Achievements />
              </ProtectedRoute>
            } />
            
            <Route path="/notifications" element={
              <ProtectedRoute>
                <NotificationSettings />
              </ProtectedRoute>
            } />
            
            <Route path="/admin" element={
              <ProtectedRoute adminOnly>
                <AdminPanel />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/analytics" element={
              <ProtectedRoute adminOnly>
                <AdminAnalytics />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/notifications" element={
              <ProtectedRoute adminOnly>
                <AdminNotifications />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/content-manager" element={
              <ProtectedRoute adminOnly>
                <ContentManager />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/create-phase" element={
              <ProtectedRoute adminOnly>
                <CreatePhase />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/create-mission" element={
              <ProtectedRoute adminOnly>
                <CreateMission />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/create-game" element={
              <ProtectedRoute adminOnly>
                <CreateGame />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/edit-phase/:id" element={
              <ProtectedRoute adminOnly>
                <EditPhase />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/edit-mission/:id" element={
              <ProtectedRoute adminOnly>
                <EditMission />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/edit-game/:id" element={
              <ProtectedRoute adminOnly>
                <EditGame />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/edit-game-content/:id" element={
             <ProtectedRoute adminOnly>
               <EditGameContent />
             </ProtectedRoute>
            } />
            
            <Route path="/admin/manage-phases" element={
              <ProtectedRoute adminOnly>
                <ManagePhases />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/task-review" element={
              <ProtectedRoute adminOnly>
                <TaskReview />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/create-achievement" element={
              <ProtectedRoute adminOnly>
                <CreateAchievement />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
