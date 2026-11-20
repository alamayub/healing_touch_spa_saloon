import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithPopup, signOut } from 'firebase/auth';
import {
  BarChart3,
  Bell,
  Building2,
  CalendarCheck,
  CalendarClock,
  CreditCard,
  FileText,
  FolderTree,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Scissors,
  Settings,
  Share2,
  Shield,
  Sparkles,
  Star,
  Tag,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { SeoHead } from '../../components/SeoHead.tsx';
import { auth, googleAuthProvider } from '../../lib/firebase.ts';
import { useAppSelector } from '../../store/index.ts';
import {
  AdminBookingsSection,
  AdminCustomersSection,
  AdminOverviewSection,
  AdminPaymentsSection,
  AdminReportsSection,
  AdminRoomScheduleSection,
  AdminSchedulesAndHolidaysSection,
} from './AdminAnalyticsAndBookings.tsx';
import {
  AdminCategoriesSection,
  AdminContentManagementSection,
  AdminNotificationsSection,
  AdminPackagesSection,
  AdminRoomsCrudSection,
  AdminSalonServicesSection,
  AdminSettingsSection,
  AdminSpaServicesSection,
  AdminStaffSection,
  AdminUsersAndRolesSection,
} from './AdminCatalogAndSystem.tsx';

type AdminTabId =
  | 'dashboard'
  | 'bookings'
  | 'spa-services'
  | 'salon-services'
  | 'categories'
  | 'packages'
  | 'therapists'
  | 'salon-staff'
  | 'rooms'
  | 'customers'
  | 'gallery'
  | 'social'
  | 'offers'
  | 'blog'
  | 'reviews'
  | 'schedules'
  | 'room-management'
  | 'payments'
  | 'notifications'
  | 'reports'
  | 'settings'
  | 'users'
  | 'roles';

const NAV_ITEMS: Array<{ id: AdminTabId; label: string; icon: React.FC<{ className?: string }> }> = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'bookings', label: 'Bookings', icon: CalendarCheck },
  { id: 'spa-services', label: 'Spa Services', icon: Sparkles },
  { id: 'salon-services', label: 'Salon Services', icon: Scissors },
  { id: 'categories', label: 'Categories', icon: FolderTree },
  { id: 'packages', label: 'Packages', icon: Package },
  { id: 'therapists', label: 'Therapists', icon: UserCheck },
  { id: 'salon-staff', label: 'Salon Staff', icon: Users },
  { id: 'rooms', label: 'Rooms and Facilities', icon: Building2 },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'gallery', label: 'Gallery', icon: ImageIcon },
  { id: 'social', label: 'Social Media', icon: Share2 },
  { id: 'offers', label: 'Offers', icon: Tag },
  { id: 'blog', label: 'Blog', icon: FileText },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'schedules', label: 'Staff Schedules', icon: CalendarClock },
  { id: 'room-management', label: 'Room Management', icon: Building2 },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'settings', label: 'Website Settings', icon: Settings },
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'roles', label: 'Roles and Permissions', icon: Shield },
];

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { authReady, user, isAdmin } = useAppSelector((s) => s.ui);
  const [activeTab, setActiveTab] = useState<AdminTabId>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSelectTab = (tabId: AdminTabId) => {
    setActiveTab(tabId);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch {
      setAuthError('Sign-in was cancelled or blocked. Allow popups and try again.');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FBF9F5]">
        <p className="text-sm text-[#858078]">Verifying session...</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FBF9F5] px-4">
        <SeoHead
          title="Admin Sign In"
          description="Authorized management sign-in for Healing Touch Spa & Saloon."
          noIndex
        />
        <div className="w-full max-w-md border border-[#183D35]/15 bg-white p-8 space-y-5">
          <p className="text-xs font-semibold tracking-wider text-[#858078]">
            Healing Touch Management
          </p>
          <h1 className="font-display text-3xl font-medium text-[#183D35]">
            Admin Console Access
          </h1>
          {!user ? (
            <>
              <p className="text-sm text-[#252525]/80">
                Sign in with your authorized Google account to manage bookings, spa/salon services, rooms, staff schedules, and payments.
              </p>
              {authError && <p className="text-xs text-red-700">{authError}</p>}
              <button
                type="button"
                onClick={handleLogin}
                className="w-full rounded-sm bg-[#183D35] px-5 py-3 text-xs font-semibold text-[#FBF9F5] hover:bg-[#112C26]"
              >
                Sign in with Google
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-[#252525]/80">
                Signed in as <strong>{user.email}</strong>. This account does not have active admin permissions in the directory yet.
              </p>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full rounded-sm border border-[#183D35] px-5 py-2.5 text-xs font-semibold text-[#183D35]"
              >
                Sign Out
              </button>
            </>
          )}
          <div className="border-t border-[#183D35]/10 pt-4 text-center">
            <Link to="/" className="text-xs font-medium text-[#183D35] underline">
              Return to Public Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentLabel = NAV_ITEMS.find((i) => i.id === activeTab)?.label || 'Dashboard';

  return (
    <div className="flex min-h-screen bg-[#F6F0E7]/50 text-[#252525]">
      <SeoHead
        title={`Admin — ${currentLabel}`}
        description="Healing Touch Spa & Saloon operations and booking management dashboard."
        noIndex
      />

      {/* Sidebar Desktop */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-[#183D35]/15 bg-[#183D35] text-[#F6F0E7] lg:sticky lg:top-0 lg:flex lg:h-screen">
        <div className="shrink-0 border-b border-[#F6F0E7]/10 px-6 py-5">
          <Link to="/" className="font-display text-2xl font-medium text-[#FBF9F5]">
            Healing Touch
          </Link>
          <p className="mt-0.5 text-[11px] text-[#C4A36A]">Admin Operations</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTab(item.id)}
                className={`flex w-full items-center gap-2.5 rounded-sm px-3 py-2 text-left text-xs font-medium transition-colors ${
                  active
                    ? 'bg-[#C4A36A] text-[#183D35] font-semibold'
                    : 'text-[#F6F0E7]/85 hover:bg-[#112C26] hover:text-white'
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-[#F6F0E7]/10 p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-sm px-3 py-2 text-xs text-[#F6F0E7]/80 hover:bg-[#112C26] hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="w-64 bg-[#183D35] text-[#F6F0E7] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#F6F0E7]/10 px-5 py-4">
              <span className="font-display text-xl">Healing Touch</span>
              <button type="button" onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectTab(item.id)}
                  className={`block w-full px-3 py-2 text-left text-xs ${
                    activeTab === item.id ? 'bg-[#C4A36A] text-[#183D35] font-semibold' : ''
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <button
                type="button"
                onClick={handleLogout}
                className="mt-4 block w-full border-t border-[#F6F0E7]/15 px-3 py-2 text-left text-xs"
              >
                Logout
              </button>
            </div>
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-[#183D35]/12 bg-white/95 backdrop-blur-xs px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="border border-[#183D35]/15 p-2 lg:hidden"
              aria-label="Open admin navigation"
            >
              <Menu className="h-4 w-4 text-[#183D35]" />
            </button>
            <div className="text-xs text-[#858078]">
              <span>Admin</span>
              <span className="mx-2">/</span>
              <strong className="font-semibold text-[#183D35]">{currentLabel}</strong>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="hidden sm:inline text-[#858078]">{user.email}</span>
            <Link
              to="/"
              className="rounded-sm border border-[#183D35]/20 px-3 py-1.5 font-medium text-[#183D35] hover:bg-[#F6F0E7] whitespace-nowrap"
            >
              View Public Site
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8">
          <div className="mx-auto max-w-6xl">
            {activeTab === 'dashboard' && <AdminOverviewSection />}
            {activeTab === 'bookings' && <AdminBookingsSection />}
            {activeTab === 'spa-services' && <AdminSpaServicesSection />}
            {activeTab === 'salon-services' && <AdminSalonServicesSection />}
            {activeTab === 'categories' && <AdminCategoriesSection />}
            {activeTab === 'packages' && <AdminPackagesSection />}
            {activeTab === 'therapists' && <AdminStaffSection divisionFilter="spa" />}
            {activeTab === 'salon-staff' && <AdminStaffSection divisionFilter="salon" />}
            {activeTab === 'rooms' && <AdminRoomsCrudSection />}
            {activeTab === 'customers' && <AdminCustomersSection />}
            {activeTab === 'gallery' && <AdminContentManagementSection mode="gallery" />}
            {activeTab === 'social' && <AdminContentManagementSection mode="social" />}
            {activeTab === 'offers' && <AdminContentManagementSection mode="offers" />}
            {activeTab === 'blog' && <AdminContentManagementSection mode="blog" />}
            {activeTab === 'reviews' && <AdminContentManagementSection mode="reviews" />}
            {activeTab === 'schedules' && <AdminSchedulesAndHolidaysSection />}
            {activeTab === 'room-management' && <AdminRoomScheduleSection />}
            {activeTab === 'payments' && <AdminPaymentsSection />}
            {activeTab === 'notifications' && <AdminNotificationsSection />}
            {activeTab === 'reports' && <AdminReportsSection />}
            {activeTab === 'settings' && <AdminSettingsSection />}
            {activeTab === 'users' && <AdminUsersAndRolesSection />}
            {activeTab === 'roles' && <AdminUsersAndRolesSection showAudit />}
          </div>
        </main>
      </div>
    </div>
  );
};
