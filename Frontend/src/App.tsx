import { Toaster } from "sonner";
import { QueryProvider } from "./providers/QueryProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
import { AppRouter } from "./routes/AppRouter";
import { useAudioPlayer } from "./hooks/useAudioPlayer";
import { ErrorBoundary } from "./components/ErrorBoundary";

function AudioEngine() {
  useAudioPlayer();
  return null;
}

const App = () => (
  <QueryProvider>
    <ThemeProvider>
      <AudioEngine />
      <ErrorBoundary>
        <AppRouter />
      </ErrorBoundary>
      <Toaster
        position="top-right"
        theme="system"
        richColors
        closeButton
        toastOptions={{
          className:
            "!rounded-lg !border !border-[rgb(var(--border-subtle))] !bg-[rgb(var(--bg-elevated))] !text-[rgb(var(--text-primary))]",
        }}
      />
    </ThemeProvider>
  </QueryProvider>
);

export default App;