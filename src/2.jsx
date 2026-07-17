import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';

// Auth pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

// App pages
import RoleSelect from '@/pages/RoleSelect';
import CustomerHome from '@/pages/CustomerHome';
import NewRequest from '@/pages/NewRequest';
import MyRequests from '@/pages/MyRequests';
import RequestDetail from '@/pages/RequestDetail';
import ProviderSetup from '@/pages/ProviderSetup';
import ProviderHome from '@/pages/ProviderHome';
import ProviderRequestDetail from '@/pages/ProviderRequestDetail';
import ProviderJobs from '@/pages/ProviderJobs';
import ProviderFind from '@/pages/ProviderFind';
import Profile from '@/pages/Profile';
import AdminDashboard from '@/pages/AdminDashboard';
import Home from '@/pages/Home';
import Notifications from '@/pages/Notifications';
import Chat from '@/pages/Chat';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }
  
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route path="/" element={<Home />} />
        <Route path="/role-select" element={<RoleSelect />} />
        <Route path="/customer" element={<CustomerHome />} />
        <Route path="/new-request" element={<NewRequest />} />
        <Route path="/my-requests" element={<MyRequests />} />
        <Route path="/request/:id" element={<RequestDetail />} />
        <Route path="/provider/setup" element={<ProviderSetup />} />
        <Route path="/provider" element={<ProviderHome />} />
        <Route path="/provider/request/:id" element={<ProviderRequestDetail />} />
        <Route path="/provider/find" element={<ProviderFind />} />
        <Route path="/provider/jobs" element={<ProviderJobs />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/chat/:id" element={<Chat />} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App