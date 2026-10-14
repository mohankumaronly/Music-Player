import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { MainLayout } from "../components/layout/MainLayout";
import { AdminLayout } from "../components/layout/AdminLayout";
import { AdminGuard } from "./AdminGuard";
import { GuestOnly } from "./GuestOnly";
import { LandingPage } from "../pages/LandingPage";
import { DiscoverPage } from "../pages/DiscoverPage";
import { PlaylistsPage } from "../pages/PlaylistsPage";
import { PlaylistDetailPage } from "../pages/PlaylistDetailPage";
import { SearchPage } from "../pages/SearchPage";
import { DocsPage } from "../pages/DocsPage";
import { AdminLoginPage } from "../pages/admin/AdminLoginPage";
import { AdminDashboardPage } from "../pages/admin/AdminDashboardPage";
import { AdminSongsPage } from "../pages/admin/AdminSongsPage";
import { AdminSongNewPage } from "../pages/admin/AdminSongNewPage";
import { AdminPlaylistsPage } from "../pages/admin/AdminPlaylistsPage";
import { AdminPlaylistDetailPage } from "../pages/admin/AdminPlaylistDetailPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { AdminSettingsPage } from "../components/admin/AdminSettingsPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Marketing landing — full bleed, no app shell */}
        <Route path="/" element={<LandingPage />} />

        {/* Public app */}
        <Route element={<MainLayout />}>
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/playlists" element={<PlaylistsPage />} />
          <Route path="/playlists/:id" element={<PlaylistDetailPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/docs" element={<DocsPage />} />
        </Route>

        {/* Admin auth — only accessible when logged OUT */}
        <Route element={<GuestOnly />}>
          <Route path="/admin/login" element={<AdminLoginPage />} />
        </Route>

        {/* Admin (protected) — only accessible when logged IN as admin */}
        <Route element={<AdminGuard />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/songs" element={<AdminSongsPage />} />
            <Route path="/admin/songs/new" element={<AdminSongNewPage />} />
            <Route path="/admin/playlists" element={<AdminPlaylistsPage />} />
            <Route
              path="/admin/playlists/:id"
              element={<AdminPlaylistDetailPage />}
            />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
          </Route>
        </Route>

        {/* Fallbacks */}
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}