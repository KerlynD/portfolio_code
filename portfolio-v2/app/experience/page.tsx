import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { getBuildSha } from "@/lib/build";
import {
  getExperiences,
  getSiteConfig,
  groupExperiences,
  type ExperienceView,
} from "@/lib/content";
import { getAllExperiences } from "@/lib/db/queries";
import { isAdmin } from "@/lib/session";
import Editable from "@/components/edit/Editable";
import ConfigFieldEditor from "@/components/edit/ConfigFieldEditor";
import {
  NewExperienceButton,
  ExperienceControls,
  AddRoleButton,
} from "@/components/edit/ExperienceEdit";
import type { Experience } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export const metadata = { title: "Experience" };

/** One role: logo + title block, responsibilities, tags. `hideRole` when an accordion bar already shows the title. */
function RoleBody({
  e,
  eager,
  hideRole = false,
}: {
  e: ExperienceView;
  eager: boolean;
  hideRole?: boolean;
}) {
  return (
    <>
      <div className="expmeta">
        <div
          className="logo"
          style={e.logoBackground ? { background: e.logoBackground } : undefined}
        >
          {e.logo ? (
            <img
              src={e.logo}
              alt={e.company}
              loading={eager ? undefined : "lazy"}
            />
          ) : (
            e.logoFallback
          )}
        </div>
        <div>
          {!hideRole && (
            <div className="role">
              {e.role}
              {e.current && <span className="current-badge">Current</span>}
            </div>
          )}
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
    </>
  );
}

export default async function ExperiencePage() {
  const [siteConfig, items, admin] = await Promise.all([
    getSiteConfig(),
    getExperiences(),
    isAdmin(),
  ]);
  const groups = groupExperiences(items);
  const companies = groups.length;

  // For admins, pull the editable DB rows (keyed by extId) so inline controls
  // have the numeric id / full record the forms need.
  const rowByExtId = new Map<string, Experience>();
  if (admin) {
    try {
      for (const row of await getAllExperiences()) rowByExtId.set(row.extId, row);
    } catch {
      /* DB unavailable — controls simply won't render */
    }
  }

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
            {"  "}
            <NewExperienceButton />
          </div>

          {groups.map((g, gi) => {
            const newest = g.roles[0];
            const eager = gi < 2;
            return (
              <section className="panel" key={g.key}>
                <div className="ph">
                  <span className="title big">{g.company}</span>
                  <span className="arch mono">{newest.period}</span>
                </div>
                <div className="pb">
                  {g.roles.length === 1 ? (
                    <>
                      <ExperienceControls item={rowByExtId.get(newest.id)} addRole />
                      <RoleBody e={newest} eager={eager} />
                    </>
                  ) : (
                    <>
                      <div className="edit-controls">
                        <AddRoleButton from={rowByExtId.get(newest.id)} />
                      </div>
                      {/* Exclusive accordion: native <details name>, no JS. Newest role starts open. */}
                      {g.roles.map((e, ri) => (
                        <details
                          className="role-acc"
                          name={`roles-${g.key}`}
                          open={ri === 0}
                          key={e.id}
                        >
                          <summary>
                            <span className="ra-title">
                              {e.role}
                              {e.current && (
                                <span className="current-badge">Current</span>
                              )}
                            </span>
                            <span className="ra-period">{e.period}</span>
                          </summary>
                          <div className="ra-body">
                            <ExperienceControls item={rowByExtId.get(e.id)} />
                            <RoleBody e={e} eager={eager} hideRole />
                          </div>
                        </details>
                      ))}
                    </>
                  )}
                </div>
              </section>
            );
          })}
        </div>

        {/* SIDEBAR */}
        <aside className="col">
          <section className="panel">
            <div className="ph">
              <span className="title">Timeline</span>
              <span className="arch">{groups.length}</span>
            </div>
            <div className="pb" style={{ padding: "10px 12px 14px" }}>
              <div className="tl-wrap">
                {groups.map((g) => (
                  <div className="tl" key={g.key}>
                    <div className="co">{g.company}</div>
                    {g.roles.length === 1 ? (
                      <div className="yr">{g.roles[0].period}</div>
                    ) : (
                      g.roles.map((e) => (
                        <div className="tl-role" key={e.id}>
                          <span className="rl">{e.role}</span>
                          <span className="yr">{e.period}</span>
                        </div>
                      ))
                    )}
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

          <Editable
            label="Currently"
            editor={
              <ConfigFieldEditor
                fields={[
                  { key: "currentRole", label: "Now (role)", value: siteConfig.currentRole },
                  { key: "statusMessage", label: "Seeking / status", value: siteConfig.statusMessage },
                ]}
              />
            }
          >
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
          </Editable>

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
