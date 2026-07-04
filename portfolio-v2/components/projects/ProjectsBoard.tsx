"use client";

import { useState } from "react";
import siteConfig from "@/data/siteConfig.json";
import projects from "@/data/projects.json";

type Project = (typeof projects)[number];

const COVER_GRADIENT: Record<string, string> = {
  "url-monitor": "linear-gradient(135deg,#4d76b8,#1a2b52)",
  mpds: "linear-gradient(135deg,#6a4a8f,#2f1f52)",
  refuconnect: "linear-gradient(135deg,#2f7d6b,#123a30)",
  "cuny-calendar": "linear-gradient(135deg,#4d5720,#242c0d)",
  "code-whisperer": "linear-gradient(135deg,#9e4a1e,#5a2610)",
  "discord-bot": "linear-gradient(135deg,#4a4d8f,#23254f)",
};

const LINK_LABELS: Record<string, string> = {
  live: "Live",
  github: "GitHub",
  devpost: "Devpost",
};

const COVER_LABEL: Record<string, string> = {
  "url-monitor": "URL",
  mpds: "MPDS",
  refuconnect: "RC",
  "cuny-calendar": "CAL",
  "code-whisperer": "CW",
  "discord-bot": "BOT",
};

function primaryTag(p: Project): string {
  return (p.tags[0] ?? "").toLowerCase();
}

function badge(p: Project): { label: string; conf: boolean } | null {
  if ("confidential" in p && p.confidential)
    return { label: "Confidential", conf: true };
  if ("hackathon" in p && p.hackathon)
    return {
      label: String(p.hackathon)
        .replace(/^[^:]*:\s*/, "")
        .replace(" Winner", ""),
      conf: false,
    };
  return null;
}

const TECH_GROUPS: { label: string; match: (t: string) => boolean }[] = [
  { label: "Go", match: (t) => /^go/i.test(t) },
  { label: "Python", match: (t) => /python/i.test(t) },
  { label: "TypeScript", match: (t) => /typescript/i.test(t) },
  { label: "React / Node", match: (t) => /react|node/i.test(t) },
  { label: "AWS / Cloud", match: (t) => /aws|cloud/i.test(t) },
  { label: "Datadog", match: (t) => /datadog/i.test(t) },
];

export default function ProjectsBoard() {
  const [active, setActive] = useState<string | null>(null);

  const techCounts = TECH_GROUPS.map((g) => ({
    label: g.label,
    count: projects.filter((p) => p.tags.some(g.match)).length,
  })).filter((g) => g.count > 0);

  const group = TECH_GROUPS.find((g) => g.label === active);
  const shown = group
    ? projects.filter((p) => p.tags.some(group.match))
    : projects;

  const wins = projects.filter(
    (p) => "hackathon" in p && p.hackathon,
  ) as Project[];
  const shipped = projects.filter(
    (p) => p.links && ("live" in p.links || "devpost" in p.links),
  ).length;

  return (
    <div className="grid main-side">
      {/* MAIN */}
      <div className="col">
        <div className="feedbar">
          <span className="lead">My Projects!</span>
          <span className="drop">{projects.length}</span>
          shipped projects across various tech stacks. I built them for fun,
          learning, and solving real-world problems.
        </div>

        <div className="pgrid">
          {shown.map((p) => {
            const b = badge(p);
            const links = Object.entries(p.links ?? {});
            return (
              <section className="panel pcard" key={p.id}>
                <div className="ph">
                  <span className="title big">{p.name}</span>
                  <span className="arch mono">{primaryTag(p)}</span>
                </div>
                <div className="pb">
                  <div
                    className="cover"
                    style={{
                      background:
                        COVER_GRADIENT[p.id] ??
                        "linear-gradient(135deg,#4d5720,#242c0d)",
                    }}
                  >
                    {p.image && <img src={p.image} alt={p.name} />}
                    <span className="scrim" />
                    {!p.image &&
                      (COVER_LABEL[p.id] ?? p.name.slice(0, 3).toUpperCase())}
                    <span className="k">
                      {p.tags[1] ? p.tags[1].toLowerCase() : primaryTag(p)}
                    </span>
                  </div>
                  <div className="badgeslot">
                    {b && (
                      <span className={`badge${b.conf ? " conf" : ""}`}>
                        {b.label}
                      </span>
                    )}
                  </div>
                  <div className="desc">{p.shortDescription}</div>
                  <div className="taglist">
                    {p.tags.map((t) => (
                      <span className="chip" key={t}>
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="plinks">
                    {links.length > 0 ? (
                      links.map(([key, url]) => (
                        <a
                          key={key}
                          href={url as string}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {LINK_LABELS[key] ?? key}
                        </a>
                      ))
                    ) : (
                      <span className="none">
                        source private — ask me about it
                      </span>
                    )}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {/* SIDEBAR */}
      <aside className="col">
        <section className="panel">
          <div className="ph">
            <span className="title">Filter by Tech</span>
          </div>
          <div className="pb" style={{ padding: "8px 12px 14px" }}>
            <button
              type="button"
              className={`frow${active === null ? " on" : ""}`}
              onClick={() => setActive(null)}
            >
              <span className="lbl">All Projects</span>
              <span className="c">
                {String(projects.length).padStart(2, "0")}
              </span>
            </button>
            {techCounts.map((g) => (
              <button
                type="button"
                key={g.label}
                className={`frow${active === g.label ? " on" : ""}`}
                onClick={() => setActive(g.label)}
              >
                <span className="lbl">{g.label}</span>
                <span className="c">{String(g.count).padStart(2, "0")}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="ph">
            <span className="title">Hackathon Wins</span>
          </div>
          <div className="pb" style={{ padding: "8px 12px 14px" }}>
            {wins.map((p) => (
              <div className="plink" key={p.id}>
                <span style={{ fontWeight: "bold", fontSize: 11 }}>
                  {p.name}
                </span>
                <span className="d">
                  <span className="win">
                    {"hackathon" in p ? String(p.hackathon) : ""}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="ph">
            <span className="title">Stats</span>
          </div>
          <div className="pb" style={{ padding: "10px 12px 14px" }}>
            <p className="statline">
              {String(projects.length).padStart(2, "0")} &nbsp;projects
              <br />
              {String(wins.length).padStart(2, "0")} &nbsp;hackathon wins
              <br />
              {String(shipped).padStart(2, "0")} &nbsp;live / shipped
            </p>
          </div>
        </section>

        <section className="panel">
          <div className="ph">
            <span className="title">Find Me</span>
          </div>
          <div className="pb elsewhere" style={{ padding: "10px 12px 14px" }}>
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
            <a href={siteConfig.links.email}>Email</a>
          </div>
        </section>
      </aside>
    </div>
  );
}
