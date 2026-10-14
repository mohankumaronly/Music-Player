import { Outlet } from "react-router-dom";
import { TopBar } from "./TopBar";
import { Sidebar } from "./Sidebar";
import { MobileSidebar } from "./MobileSidebar";
import { PlayerBar } from "../player/PlayerBar";
import { AmbientBackdrop } from "../effects/AmbientBackdrop";
import { usePlayerStore } from "../../store/playerStore";
import { cn } from "../../lib/cn";

export function MainLayout() {
  // Is the player bar visible right now?
  const hasCurrentSong = usePlayerStore((s) => s.current() !== null);

  return (
    <div className="min-h-screen">
      {/* Blurred cover backdrop — fixed, behind everything */}
      <AmbientBackdrop />

      {/* Mobile drawer (lg hidden) */}
      <MobileSidebar />

      <div className="relative flex min-h-screen flex-col">
        <TopBar />
        <div className="flex flex-1 w-full">
          {/* Desktop sidebar (lg+ only) */}
          <Sidebar />
          <main
            className={cn(
              "flex-1 min-w-0",
              // Reserve space only when the player bar is rendered
              hasCurrentSong ? "pb-20 sm:pb-24" : "pb-0"
            )}
          >
            <Outlet />
          </main>
        </div>
      </div>

      {/* Player bar — fixed, direct child of the page root */}
      <PlayerBar />
    </div>
  );
}