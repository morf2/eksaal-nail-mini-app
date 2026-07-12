import { Route, Routes } from 'react-router-dom'
import RootLayout from './RootLayout'
import AdminLayout from './AdminLayout'
import RequireAdminAuth from './RequireAdminAuth'
import HomePage from '../pages/client/home/HomePage'
import GalleryPage from '../pages/client/gallery/GalleryPage'
import BookingPage from '../pages/client/booking/BookingPage'
import ProfilePage from '../pages/client/profile/ProfilePage'
import LoginPage from '../pages/admin/login/LoginPage'
import RequestsPage from '../pages/admin/requests/RequestsPage'
import ArchivePage from '../pages/admin/archive/ArchivePage'
import AdminPortfolioPage from '../pages/admin/portfolio/AdminPortfolioPage'
import AdminServicesPage from '../pages/admin/services/AdminServicesPage'
import SchedulePage from '../pages/admin/schedule/SchedulePage'
import SettingsPage from '../pages/admin/settings/SettingsPage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      <Route path="/admin/login" element={<LoginPage />} />

      <Route element={<RequireAdminAuth />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<RequestsPage />} />
          <Route path="/admin/archive" element={<ArchivePage />} />
          <Route path="/admin/portfolio" element={<AdminPortfolioPage />} />
          <Route path="/admin/services" element={<AdminServicesPage />} />
          <Route path="/admin/schedule" element={<SchedulePage />} />
          <Route path="/admin/settings" element={<SettingsPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
