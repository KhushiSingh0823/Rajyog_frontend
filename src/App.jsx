import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Loader from './components/Loader';
import './App.css';

// Lazy load components
const Home = lazy(() => import('./pages/Home'));
const ChatWithAstrologer = lazy(() => import('./pages/ChatWithAstrologer'));
const ChatScreen = lazy(() => import('./pages/ChatScreen'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const AdminChatPage = lazy(() => import('./pages/AdminChatPage'));

// Admin
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminHome = lazy(() => import('./pages/admin/AdminHome'));
const Users = lazy(() => import('./pages/admin/Users'));
const Astrologers = lazy(() => import('./pages/admin/Astrologers'));
const VideosPage = lazy(() => import('./pages/video/VideosPage'));

// Astrologer
const AstrologerLogin = lazy(() => import('./pages/astrologer/AstrologerLogin'));
const AstrologerLayout = lazy(() => import('./components/astrologer/AstrologerLayout'));
const AstrologerHome = lazy(() => import('./pages/astrologer/AstrologerHome'));
const AstrologerUsers = lazy(() => import('./pages/astrologer/AstrologerUsers'));
const AstrologerProfile = lazy(() => import('./pages/astrologer/AstrologerProfile'));

// Blog Pages
const BlogList = lazy(() => import("./pages/blog/BlogList"));
const BlogCreate = lazy(() => import("./pages/blog/BlogCreate"));
const BlogEdit = lazy(() => import("./pages/blog/BlogEdit"));

// Banner Pages
const BannerList = lazy(() => import("./pages/banner/BannerList"));
const BannerCreate = lazy(() => import("./pages/banner/AddBannerModal"));

// Horoscope Pages
const DailyHoroscope = lazy(() => import('./pages/horoscope/DailyHoroscope'));
const WeeklyHoroscope = lazy(() => import('./pages/horoscope/WeeklyHoroscope'));
const YearlyHoroscope = lazy(() => import('./pages/horoscope/YearlyHoroscope'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>

          {/* Main Site Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/home" replace />} />
            <Route path="home" element={<Home />} />
            <Route path="chat-with-astrologer" element={<ChatWithAstrologer />} />
            <Route path="chat" element={<ChatScreen />} />
            <Route path="messages" element={<ChatPage />} />
            <Route path="chat-with-admin" element={<AdminChatPage />} />
          </Route>

          {/* Admin Login */}
          <Route path="/admin" element={<AdminLogin />} />

          {/* Admin Panel Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminHome />} />
            <Route path="users" element={<Users />} />
            <Route path="astrologers" element={<Astrologers />} />
            <Route path="videos" element={<VideosPage />} /> {/* Works now */}
            
            {/* Blog Routes */}
            <Route path="blogs" element={<BlogList />} />
            <Route path="blogs/create" element={<BlogCreate />} />
            <Route path="blogs/edit/:id" element={<BlogEdit />} />

            {/* Banner Routes */}
            <Route path="banner" element={<BannerList />} />
            <Route path="banner/create" element={<BannerCreate />} />

            {/* Horoscope Routes */}
            <Route path="horoscope/daily" element={<DailyHoroscope />} />
            <Route path="horoscope/weekly" element={<WeeklyHoroscope />} />
            <Route path="horoscope/yearly" element={<YearlyHoroscope />} />

            {/* Other Admin Pages */}
            <Route path="services" element={
              <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold mb-4">Services Management</h2>
                <p>Coming Soon...</p>
              </div>
            } />
            <Route path="products" element={
              <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold mb-4">Products Management</h2>
                <p>Coming Soon...</p>
              </div>
            } />
            <Route path="orders" element={
              <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold mb-4">Orders Management</h2>
                <p>Coming Soon...</p>
              </div>
            } />
            <Route path="analytics" element={
              <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold mb-4">Analytics Dashboard</h2>
                <p>Coming Soon...</p>
              </div>
            } />
            <Route path="settings" element={
              <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold mb-4">System Settings</h2>
                <p>Coming Soon...</p>
              </div>
            } />
          </Route>

          {/* Astrologer Login */}
          <Route path="/astrologer" element={<AstrologerLogin />} />

          {/* Astrologer Panel Routes */}
          <Route path="/astrologer/dashboard" element={<AstrologerLayout />}>
            <Route index element={<AstrologerHome />} />
            <Route path="users" element={<AstrologerUsers />} />
            <Route path="profile" element={<AstrologerProfile />} />
          </Route>

        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
