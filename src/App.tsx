import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { Provider } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import {
  BackToTopButton,
  PageTransition,
  ScrollProgressBar,
} from './components/ui/MotionPrimitives.tsx';
import { auth } from './lib/firebase.ts';
import { checkIsCurrentUserAdmin } from './services/firestoreService.ts';
import { store, useAppDispatch } from './store/index.ts';
import { setAuthState } from './store/slices/uiSlice.ts';

const HomePage = lazy(() => import('./pages/HomePage.tsx').then((m) => ({ default: m.HomePage })));
const SpaServicesPage = lazy(() =>
  import('./pages/SpaServicesPage.tsx').then((m) => ({ default: m.SpaServicesPage }))
);
const SalonServicesPage = lazy(() =>
  import('./pages/SalonServicesPage.tsx').then((m) => ({ default: m.SalonServicesPage }))
);
const PackagesPage = lazy(() =>
  import('./pages/PackagesPage.tsx').then((m) => ({ default: m.PackagesPage }))
);
const ExperiencePage = lazy(() =>
  import('./pages/ExperiencePage.tsx').then((m) => ({ default: m.ExperiencePage }))
);
const AboutPage = lazy(() =>
  import('./pages/AboutPage.tsx').then((m) => ({ default: m.AboutPage }))
);
const TeamPage = lazy(() => import('./pages/TeamPage.tsx').then((m) => ({ default: m.TeamPage })));
const GalleryPage = lazy(() =>
  import('./pages/GalleryPage.tsx').then((m) => ({ default: m.GalleryPage }))
);
const BookingPage = lazy(() =>
  import('./pages/BookingPage.tsx').then((m) => ({ default: m.BookingPage }))
);
const MyBookingsPage = lazy(() =>
  import('./pages/MyBookingsPage.tsx').then((m) => ({ default: m.MyBookingsPage }))
);
const ContactPage = lazy(() =>
  import('./pages/ContactPage.tsx').then((m) => ({ default: m.ContactPage }))
);
const SocialPage = lazy(() =>
  import('./pages/SecondaryPages.tsx').then((m) => ({ default: m.SocialPage }))
);
const OffersPage = lazy(() =>
  import('./pages/SecondaryPages.tsx').then((m) => ({ default: m.OffersPage }))
);
const BlogListPage = lazy(() =>
  import('./pages/SecondaryPages.tsx').then((m) => ({ default: m.BlogListPage }))
);
const BlogPostPage = lazy(() =>
  import('./pages/SecondaryPages.tsx').then((m) => ({ default: m.BlogPostPage }))
);
const ReviewsPage = lazy(() =>
  import('./pages/SecondaryPages.tsx').then((m) => ({ default: m.ReviewsPage }))
);
const FaqPage = lazy(() =>
  import('./pages/SecondaryPages.tsx').then((m) => ({ default: m.FaqPage }))
);
const PrivacyPolicyPage = lazy(() =>
  import('./pages/SecondaryPages.tsx').then((m) => ({ default: m.PrivacyPolicyPage }))
);
const TermsPage = lazy(() =>
  import('./pages/SecondaryPages.tsx').then((m) => ({ default: m.TermsPage }))
);
const NotFoundPage = lazy(() =>
  import('./pages/SecondaryPages.tsx').then((m) => ({ default: m.NotFoundPage }))
);
const AdminDashboardPage = lazy(() =>
  import('./pages/admin/AdminDashboardPage.tsx').then((m) => ({ default: m.AdminDashboardPage }))
);

const AuthSyncListener: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        dispatch(setAuthState({ authReady: true, user: null, isAdmin: false }));
        return;
      }
      const isAdmin = await checkIsCurrentUserAdmin();
      dispatch(
        setAuthState({
          authReady: true,
          user: {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName,
            photoURL: fbUser.photoURL,
            emailVerified: fbUser.emailVerified,
          },
          isAdmin,
        })
      );
    });
    return () => unsub();
  }, [dispatch]);

  return null;
};

const RouteFallback: React.FC = () => (
  <div className="flex min-h-screen items-center justify-center bg-[#FBF9F5]">
    <p className="font-display text-2xl text-[#183D35]">Healing Touch</p>
  </div>
);

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    const timer = window.setTimeout(() => {
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 120);
    return () => window.clearTimeout(timer);
  }, [location.pathname, location.hash]);

  return (
    <AnimatePresence
      mode="wait"
      initial={false}
      onExitComplete={() => {
        if (!window.location.hash) {
          window.scrollTo({ top: 0, behavior: 'auto' });
        }
      }}
    >
      <PageTransition key={location.pathname}>
        <Suspense fallback={<RouteFallback />}>
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/spa" element={<SpaServicesPage />} />
            <Route path="/salon" element={<SalonServicesPage />} />
            <Route path="/packages" element={<PackagesPage />} />
            <Route path="/experience" element={<ExperiencePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/my-bookings" element={<MyBookingsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/social" element={<SocialPage />} />
            <Route path="/offers" element={<OffersPage />} />
            <Route path="/blog" element={<BlogListPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </PageTransition>
    </AnimatePresence>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <AuthSyncListener />
        <BrowserRouter>
          <ScrollProgressBar />
          <AnimatedRoutes />
          <BackToTopButton />
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  );
}
