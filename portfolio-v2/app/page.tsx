import Link from "next/link";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import VitalsPanel from "@/components/panels/VitalsPanel";
import CurrentlyPanel from "@/components/panels/CurrentlyPanel";
import { getBuildSha } from "@/lib/build";
import { getPublishedPosts } from "@/lib/db/queries";
import {
  getExperiences,
  getProjects,
  getSiteConfig,
  type ProjectView,
} from "@/lib/content";
import { formatDate } from "@/lib/markdown";
import communities from "@/data/communities.json";

export const dynamic = "force-dynamic";

function projectBadge(p: ProjectView): string | null {
  if (p.confidential) return "confidential";
  if (p.hackathon) return String(p.hackathon).split(":")[0];
  return null;
}

export default async function Home() {
  const siteConfig = await getSiteConfig();
  const feed = (await getPublishedPosts()).slice(0, 6);
  const experiences = await getExperiences();
  const now = experiences[0];
  const topProjects = (await getProjects()).slice(0, 4);

  return (
    <div className="shell">
      <SiteHeader
        active="home"
        ghost={["HOME"]}
        readoutTop="whoami :: angel"
        ticker={[
          `now :: ${siteConfig.currentRole}`,
          siteConfig.statusMessage,
          `reading :: ${siteConfig.currentlyReading}`,
          "notes & reviews :: coming soon",
        ]}
        build={getBuildSha()}
      />

      <div className="grid three">
        {/* LEFT */}
        <aside className="col">
          <section className="panel featured">
            <div className="ph">
              <span className="title">Now</span>
              <span className="arch">current</span>
            </div>
            <div className="pb">
              <div
                className="cover"
                style={{
                  background: "linear-gradient(135deg,#4d76b8,#20386a)",
                }}
              >
                {now.logo ? (
                  <img src={now.logo} alt={now.company} />
                ) : (
                  now.logoFallback
                )}
              </div>
              <div className="fk">{now.role}</div>
              <div className="ft">{now.company}</div>
              <p>{now.description}</p>
            </div>
          </section>

          <VitalsPanel />

          <CurrentlyPanel />
        </aside>

        {/* CENTER: updates feed */}
        <main className="col">
          <div className="feedbar">
            <span className="lead">Updates - Little Opinions I Have</span>
            <span className="drop">I</span>
            like to write about stuff i'm reading or things i'm watching.
            Occasionally deep dives onto projects I'm working on.
          </div>

          <section className="panel">
            <div className="ph">
              <span className="title">The Feed</span>
              <span className="arch">latest</span>
            </div>
            {feed.length === 0 ? (
              <div className="pb feed-empty">
                <div className="big">Writing — coming soon</div>
                <p>Notes, writeups &amp; book/paper reviews will land here.</p>
                <div className="blink">» stay tuned _</div>
              </div>
            ) : (
              <div>
                {feed.map((post, i) => (
                  <article className="post" key={post.id}>
                    <span
                      className={`kind${post.kind === "Review" ? " review" : post.kind === "Paper Notes" ? " notes" : ""}`}
                    >
                      {post.kind}
                    </span>
                    <h3>
                      <span className="idx">
                        {String.fromCharCode(65 + i)}.
                      </span>{" "}
                      <Link href={`/writing/${post.slug}`}>{post.title}</Link>
                    </h3>
                    <div className="meta">
                      {formatDate(post.postDate)} :: {post.category}
                      {post.rating ? (
                        <>
                          {" · "}
                          <span className="stars">{"★".repeat(post.rating)}</span>
                        </>
                      ) : null}
                    </div>
                    <div className="body">
                      {post.cover && (
                        <div className="thumb">
                          <img src={post.cover} alt="" />
                        </div>
                      )}
                      <div>
                        {post.excerpt && <p>{post.excerpt}</p>}
                        <Link className="more" href={`/writing/${post.slug}`}>
                          continue reading »
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
                <div className="pf">
                  <Link href="/writing">» all writing</Link>
                </div>
              </div>
            )}
          </section>
        </main>

        {/* RIGHT */}
        <aside className="col">
          <section className="panel">
            <div className="ph">
              <span className="title">Top Projects</span>
              <span className="arch">all »</span>
            </div>
            <div className="pb" style={{ padding: "8px 12px 15px" }}>
              {topProjects.map((p) => {
                const badge = projectBadge(p);
                return (
                  <div className="plink" key={p.id}>
                    <Link href="/projects">{p.name}</Link>
                    <span className="d">
                      {p.shortDescription}
                      {badge && (
                        <>
                          {" "}
                          <span className="badge">{badge}</span>
                        </>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="pf">
              <Link href="/projects">» all projects</Link>
            </div>
          </section>

          <section className="panel">
            <div className="ph">
              <span className="title">Communities</span>
            </div>
            <div className="pb" style={{ padding: "8px 12px 15px" }}>
              {communities.map((c) => (
                <div className="plink" key={c.id}>
                  <Link href="/about">{c.name}</Link>
                  <span className="d">{c.description.split(".")[0]}.</span>
                </div>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="ph">
              <span className="title">Elsewhere</span>
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

      <SiteFooter page="home" />
    </div>
  );
}
