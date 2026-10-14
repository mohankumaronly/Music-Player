import { Component, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "./ui/Button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}
interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error("[ErrorBoundary]", error, info);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <div className="min-h-screen grid place-items-center px-6">
            <div className="text-center max-w-md">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red-500/10 text-red-500">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h1 className="mt-4 text-xl font-semibold">Something went wrong</h1>
              <p className="mt-2 text-sm text-[rgb(var(--text-secondary))]">
                {this.state.error.message || "An unexpected error occurred."}
              </p>
              <div className="mt-6 flex justify-center gap-2">
                <Button variant="outline" onClick={this.reset}>
                  Try again
                </Button>
                <Button variant="gradient" onClick={() => window.location.href = "/"}>
                  Go home
                </Button>
              </div>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}