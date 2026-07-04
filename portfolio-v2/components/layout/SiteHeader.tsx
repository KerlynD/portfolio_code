import Link from "next/link";
import siteConfig from "@/data/siteConfig.json";
import Metrics from "./Metrics";

export type PageKey = "home" | "experience" | "projects" | "writing" | "about";

const NAV: { key: PageKey; label: string; href: string }[] = [
  { key: "home", label: "Home", href: "/" },
  { key: "experience", label: "Experience", href: "/experience" },
  { key: "projects", label: "Projects", href: "/projects" },
  { key: "writing", label: "Writing", href: "/writing" },
  { key: "about", label: "About", href: "/about" },
];

const SUBTITLE = "Software Engineer / Notes & Reviews";

function brandParts(fullName: string): [string, string] {
  const parts = fullName.trim().split(/\s+/);
  const last = parts[parts.length - 1] || "";
  const first = parts.length > 1 ? parts[parts.length - 2] : "";
  return [first, last];
}

export default function SiteHeader({
  active,
  ghost,
  readoutTop,
  ticker,
  build,
}: {
  active: PageKey;
  ghost: string[];
  readoutTop: string;
  ticker: string[];
  build: string;
}) {
  const [first, last] = brandParts(siteConfig.name);
  const location = siteConfig.location.replace(/[^\x00-\x7F]/g, "").trim();
  const doubled = [...ticker, ...ticker];

  return (
    <>
      <header className="masthead">
        <svg
          className="mast-graph"
          viewBox="0 0 1080 172"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <polyline
            fill="none"
            stroke="#f4f1e6"
            strokeWidth="1.1"
            points="0,132 90,120 180,138 270,86 360,104 450,60 540,78 630,44 720,70 810,34 900,64 990,28 1080,50"
          />
          <polyline
            fill="none"
            stroke="#f4f1e6"
            strokeWidth="0.6"
            strokeDasharray="2 5"
            opacity="0.6"
            points="0,150 1080,150"
          />
          <g fill="#f4f1e6">
            <circle cx="270" cy="86" r="2.4" />
            <circle cx="450" cy="60" r="2.4" />
            <circle cx="630" cy="44" r="2.4" />
            <circle cx="810" cy="34" r="2.4" />
            <circle cx="990" cy="28" r="2.4" />
          </g>
        </svg>

        <div className="mast-ghost">
          {ghost.map((line, i) => (
            <span key={i}>
              {line}
              {i < ghost.length - 1 && <br />}
            </span>
          ))}
        </div>

        <Metrics topLine={readoutTop} build={build} />

        <div className="mast-brand">
          <div className="mast-title">
            {first} <b>{last}</b>
          </div>
          <div className="mast-sub">{SUBTITLE}</div>
        </div>

        <div className="mast-right">
          {location}
          <br />
          <span className="stat">
            est. {siteConfig.graduationYear} — cuny qc
          </span>
          <br />
          {siteConfig.statusMessage}
        </div>
      </header>

      <nav className="primary">
        {NAV.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={`tab${active === item.key ? " active" : ""}`}
          >
            <span>{item.label}</span>
          </Link>
        ))}
        <span className="spacer" />
        <span className="util">
          <a
            href={siteConfig.links.github}
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a
            href={siteConfig.links.linkedin}
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
          <a
            href={siteConfig.links.resume}
            target="_blank"
            rel="noopener noreferrer"
          >
            Résumé
          </a>
        </span>
      </nav>

      <div className="ticker">
        <div className="track">
          {doubled.map((item, i) => (
            <span
              key={i}
              className={i % ticker.length === 0 ? "hot" : undefined}
            >
              {item} <span className="dmd">◆</span>
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
