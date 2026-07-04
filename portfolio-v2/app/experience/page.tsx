import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { getBuildSha } from "@/lib/build";
import { getExperiences, getSiteConfig } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const siteConfig = await getSiteConfig();
  return { title: `Experience | ${siteConfig.name}` };
}

export default async function ExperiencePage() {
  const siteConfig = await getSiteConfig();
  const items = await getExperiences();
  const companies = new Set(items.map((e) => e.company)).size;

  return (
    <div className="shell">
      <SiteHeader
        active="experience"
        ghost={["THE", "LOG"]}
        readoutTop={`history :: ${items.length} roles`}
        ticker={items
          .slice(0, 4)
          .map((e) => `${e.company} — ${e.team.split("|")[0].trim()}`)}
        build={getBuildSha()}
      />

      <div className="grid main-side">
        {/* MAIN */}
        <div className="col">
          <div className="feedbar">
            <span className="lead">The Job Log - Where I've Worked</span>
            <span className="drop">{items.length}</span>
            roles across cloud infrastructure, observability, fintech and
            biomedical data. Newest first. Each entry lists what I actually
            shipped in each.
          </div>

          {items.map((e) => (
            <section className="panel" key={e.id}>
              <div className="ph">
                <span className="title big">{e.company}</span>
                <span className="arch mono">{e.period}</span>
              </div>
              <div className="pb">
                <div className="expmeta">
                  <div
                    className="logo"
                    style={
                      e.logoBackground
                        ? { background: e.logoBackground }
                        : undefined
                    }
                  >
                    {e.logo ? (
                      <img src={e.logo} alt={e.company} />
                    ) : (
                      e.logoFallback
                    )}
                  </div>
                  <div>
                    <div className="role">
                      {e.role}
                      {e.current && (
                        <span className="current-badge">Current</span>
                      )}
                    </div>
                    <div className="team">{e.team}</div>
                    <div className="desc">{e.description}</div>
                  </div>
                </div>

                {e.responsibilities.length > 0 && (
                  <ul className="resp">
                    {e.responsibilities.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                )}

                <div className="taglist">
                  {e.tags.map((t) => (
                    <span className="chip" key={t}>
                      {t}
                    </span>
                  ))}
                  {e.highlights.map((h) => (
                    <span className="hl" key={h}>
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>

        {/* SIDEBAR */}
        <aside className="col">
          <section className="panel">
            <div className="ph">
              <span className="title">Timeline</span>
              <span className="arch">{items.length}</span>
            </div>
            <div className="pb" style={{ padding: "10px 12px 14px" }}>
              <div className="tl-wrap">
                {items.map((e) => (
                  <div className="tl" key={e.id}>
                    <div className="co">{e.company}</div>
                    <div className="yr">{e.period}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="ph">
              <span className="title">Stats</span>
            </div>
            <div className="pb" style={{ padding: "10px 12px 14px" }}>
              <p className="statline">
                {String(items.length).padStart(2, "0")} &nbsp;roles
                <br />
                {String(companies).padStart(2, "0")} &nbsp;companies
                <br />
                04 &nbsp;years shipping
              </p>
            </div>
          </section>

          <section className="panel">
            <div className="ph">
              <span className="title">Currently</span>
            </div>
            <div className="pb nowbox" style={{ padding: "10px 12px 14px" }}>
              <div className="np">
                <span className="nk">Now</span>
                <br />
                {siteConfig.currentRole}
              </div>
              <div className="np">
                <span className="nk">Seeking</span>
                <br />
                {siteConfig.statusMessage}
              </div>
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

      <SiteFooter page="experience" />
    </div>
  );
}
