import { Copy, ExternalLink, Server, Terminal } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { APP_NAME, GITHUB_URL } from "../lib/constants";
import { Button } from "../components/ui/Button";
import { GithubIcon } from "../components/ui/GithubIcon";
import { cn } from "../lib/cn";

interface Step {
  title: string;
  description: string;
  command?: string;
  note?: string;
}

const steps: Step[] = [
  {
    title: "1. Clone the repository",
    description: "Get the source code from GitHub.",
    command: `git clone ${GITHUB_URL}.git\ncd music-platform`,
  },
  {
    title: "2. Configure environment",
    description:
      "Copy the example env file and fill in your Cloudinary and Brevo credentials.",
    command: "cp .env.example .env\n# edit .env with your values",
    note: "You'll need: PostgreSQL, Cloudinary (audio + cover storage), and Brevo (OTP emails).",
  },
  {
    title: "3. Start the backend",
    description:
      "Runs on port 8080. Flyway will apply migrations on first boot.",
    command: "cd backend\n./mvnw spring-boot:run",
    note: "Java 17+ required. First run may take 1-2 minutes.",
  },
  {
    title: "4. Start the frontend",
    description: "Runs on port 5173 with Vite HMR.",
    command: "cd frontend\nnpm install\nnpm run dev",
  },
  {
    title: "5. Sign in as admin",
    description:
      "Open the site, go to /admin/login, and sign in with the email you set as ADMIN_EMAIL. You'll receive a 6-digit code by email.",
    command: "open http://localhost:5173/admin/login",
  },
];

const envVars: { key: string; description: string; example: string }[] = [
  {
    key: "DB_URL",
    description: "PostgreSQL JDBC URL",
    example: "jdbc:postgresql://localhost:5432/music_platform",
  },
  {
    key: "DB_USERNAME",
    description: "Database user",
    example: "postgres",
  },
  {
    key: "DB_PASSWORD",
    description: "Database password",
    example: "••••••••",
  },
  {
    key: "CLOUDINARY_CLOUD_NAME",
    description: "Cloudinary cloud name",
    example: "your-cloud",
  },
  {
    key: "CLOUDINARY_API_KEY",
    description: "Cloudinary API key",
    example: "1234567890",
  },
  {
    key: "CLOUDINARY_API_SECRET",
    description: "Cloudinary API secret",
    example: "••••••••",
  },
  {
    key: "BREVO_API_KEY",
    description: "Brevo API key for OTP emails",
    example: "xkeysib-...",
  },
  {
    key: "ADMIN_EMAIL",
    description: "Email allowed to sign in as admin",
    example: "you@example.com",
  },
  {
    key: "JWT_SECRET",
    description: "Long random string (32+ bytes)",
    example: "••••••••",
  },
];

export function DocsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-[rgb(var(--text-tertiary))]">
        <Server className="h-3.5 w-3.5" />
        Self-host guide
      </div>
      <h1 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
        Deploy {APP_NAME} on your own server
      </h1>
      <p className="mt-3 text-[rgb(var(--text-secondary))]">
        Runs on any Linux box with Docker or Java 17 + Node 20. You own the
        data, the domain, and the uptime.
      </p>

      {/* Quick links */}
      <div className="mt-6 flex flex-wrap gap-2">
        <a href={GITHUB_URL} target="_blank" rel="noreferrer">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<GithubIcon className="h-4 w-4" />}
          >
            View on GitHub
          </Button>
        </a>
        <a href={`${GITHUB_URL}/issues`} target="_blank" rel="noreferrer">
          <Button
            variant="ghost"
            size="sm"
            rightIcon={<ExternalLink className="h-4 w-4" />}
          >
            Report an issue
          </Button>
        </a>
      </div>

      {/* Steps */}
      <section className="mt-12 space-y-8">
        {steps.map((step) => (
          <Step key={step.title} step={step} />
        ))}
      </section>

      {/* Env vars reference */}
      <section className="mt-16">
        <h2 className="text-xl font-semibold tracking-tight">
          Environment variables
        </h2>
        <p className="mt-2 text-sm text-[rgb(var(--text-secondary))]">
          All variables are read from a single{" "}
          <code className="rounded bg-[rgb(var(--bg-muted))] px-1.5 py-0.5 text-xs font-mono">
            .env
          </code>{" "}
          file at the project root.
        </p>

        <div className="mt-6 overflow-hidden rounded-xl surface divide-y divide-[rgb(var(--border-subtle))]">
          {envVars.map((v) => (
            <div
              key={v.key}
              className="grid sm:grid-cols-[220px_1fr_auto] gap-2 px-4 py-3"
            >
              <code className="font-mono text-xs text-brand-500">{v.key}</code>
              <span className="text-xs text-[rgb(var(--text-secondary))]">
                {v.description}
              </span>
              <span className="hidden sm:block text-xs font-mono text-[rgb(var(--text-tertiary))]">
                {v.example}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer note */}
      <section className="mt-12 rounded-xl surface p-5 text-sm">
        <p className="text-[rgb(var(--text-secondary))]">
          Deployed successfully? Consider starring the repo ⭐ — it helps
          others discover the project.
        </p>
      </section>
    </div>
  );
}

function Step({ step }: { step: Step }) {
  return (
    <div>
      <h2 className="text-lg font-semibold tracking-tight">{step.title}</h2>
      <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">
        {step.description}
      </p>
      {step.command && <CodeBlock code={step.command} />}
      {step.note && (
        <p className="mt-2 text-xs text-[rgb(var(--text-tertiary))]">
          {step.note}
        </p>
      )}
    </div>
  );
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy");
    }
  };

  return (
    <div className="relative mt-3 group">
      <pre className="overflow-x-auto rounded-xl surface px-4 py-3 text-xs font-mono">
        <code>{code}</code>
      </pre>
      <button
        type="button"
        onClick={copy}
        className={cn(
          "absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-md transition-colors",
          "bg-[rgb(var(--bg-muted))] text-[rgb(var(--text-tertiary))]",
          "opacity-0 group-hover:opacity-100 hover:text-[rgb(var(--text-primary))]"
        )}
        aria-label="Copy"
      >
        {copied ? (
          <Terminal className="h-3.5 w-3.5 text-emerald-500" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}