import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import VitalsPanel from "@/components/panels/VitalsPanel";
import CurrentlyPanel from "@/components/panels/CurrentlyPanel";
import { getBuildSha } from "@/lib/build";
import siteConfig from "@/data/siteConfig.json";
import communities from "@/data/communities.json";

export const metadata = { title: `About | ${siteConfig.name}` };

const KEYWORD_GLYPH: Record<string, string> = {
  graduation: "🎓",
  trophy: "🏆",
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function AboutPage() {
  const location = siteConfig.location.replace(/[^\x00-\x7F]/g, "").trim();

  return (
    <div className="shell">
      <SiteHeader
        active="about"
        ghost={["ABOUT", "ME"]}
        readoutTop="whoami :: angel"
        ticker={[
          `CS @ ${siteConfig.school} '${siteConfig.graduationYear.slice(2)}`,
          "board member :: Code For All (1,800+ members)",
          `reading :: ${siteConfig.currentlyReading}`,
          "2x hackathon winner",
        ]}
        build={getBuildSha()}
      />

      <div className="grid main-side">
        {/* MAIN */}
        <div className="col">
          <section className="panel">
            <div className="ph">
              <span className="title">Profile</span>
              <span className="arch">whoami</span>
            </div>
            <div className="pb bio-hero">
              <img
                className="portrait"
                src="/assets/profile/profile.jpg"
                alt={siteConfig.name}
              />
              <div className="who">
                <div className="role">
                  {siteConfig.currentRole.toLowerCase()}
                </div>
                <h1>{siteConfig.name}</h1>
                <div className="tag">
                  &ldquo;{siteConfig.aboutTagline}&rdquo;
                </div>
                <p>{siteConfig.bio}</p>
                <div className="factbar">
                  <span className="fact">
                    <b>⚑</b> {location}
                  </span>
                  <span className="fact">
                    <b>⚑</b> {siteConfig.education}
                  </span>
                  <span className="fact">
                    <b>⚑</b> {siteConfig.currentRole.replace(/ at .*/, "")}
                  </span>
                  <span className="fact">
                    <b>⚑</b> Backend & Machine Learning
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="ph">
              <span className="title">Who I Am</span>
            </div>
            <div className="pb prose">
              <p>
                <span className="drop">
                  {siteConfig.aboutDescription.charAt(0)}
                </span>
                {siteConfig.aboutDescription.slice(1)}
              </p>
              <p>
                As much as I love my work, I'm still learning who I am, and I
                want to keep learning and growing.
              </p>
            </div>
          </section>

          <section className="panel">
            <div className="ph">
              <span className="title">Communities</span>
              <span className="arch">where I show up</span>
            </div>
            <div className="pb" style={{ padding: 0 }}>
              {communities.map((c) => (
                <div className="commcard" key={c.id}>
                  {c.icon ? (
                    <img className="ic" src={c.icon} alt={c.name} />
                  ) : (
                    <div className="ic">{initials(c.name)}</div>
                  )}
                  <div>
                    <h5>{c.name}</h5>
                    <p>{c.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="ph">
              <span className="title">Achievements</span>
            </div>
            <div className="pb" style={{ padding: 0 }}>
              {siteConfig.achievements.map((a, i) => (
                <div className="ach" key={i}>
                  <div className="medal">
                    {a.icon?.startsWith("/") ? (
                      <img src={a.icon} alt="" />
                    ) : (
                      (KEYWORD_GLYPH[a.icon] ?? "✎")
                    )}
                  </div>
                  <div>
                    <div className="at">{a.title}</div>
                    <div className="ao">{a.organization}</div>
                    <p>{a.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* SIDEBAR */}
        <aside className="col">
          <VitalsPanel />

          <CurrentlyPanel />

          <section className="panel">
            <div className="ph">
              <span className="title">Skills</span>
              <span className="arch">arsenal</span>
            </div>
            <div className="pb">
              {Object.entries(siteConfig.skills).map(([group, items]) => (
                <div className="skillrow" key={group}>
                  <span className="lbl">{group}</span>
                  {(items as string[]).map((s) => (
                    <span className="chip" key={s}>
                      {s}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="ph">
              <span className="title">Find Me</span>
            </div>
            <div className="pb elsewhere">
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

      <SiteFooter page="about" />
    </div>
  );
}
