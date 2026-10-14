    import { Outlet } from "react-router-dom";
import { TopBar } from "./TopBar";
import { Sidebar } from "./Sidebar";

/**
 * Admin layout: solid (non-glass) surfaces, no ambient light.
 * Sidebar rendering rules inside Sidebar (only shows Admin section when isAdmin).
 */
export function AdminLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[rgb(var(--bg-canvas))]">
      <TopBar />
      <div className="flex flex-1 w-full">
        <Sidebar />
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}