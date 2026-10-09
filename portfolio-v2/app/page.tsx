import Link from "next/link";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import VitalsPanel from "@/components/panels/VitalsPanel";
import CurrentlyPanel from "@/components/panels/CurrentlyPanel";
import NowPanel from "@/components/panels/NowPanel";
import NewPostButton from "@/components/edit/NewPostButton";
import PostEditButton from "@/components/edit/PostEditButton";
import { NewProjectButton, ProjectControls } from "@/components/edit/ProjectEdit";
import { NewCommunityButton, CommunityControls } from "@/components/edit/CommunityEdit";
import { getBuildSha } from "@/lib/build";
import { getPublishedPosts, getAllProjects, getAllCommunities, getEmojis } from "@/lib/db/queries";
import { toEmojiMap } from "@/lib/emoji";
import RichTitle from "@/components/RichTitle";
import { isAdmin } from "@/lib/session";
import {
  getProjects,
  getCommunities,
  getExperiences,
  getSiteConfig,
  type ProjectView,
} from "@/lib/content";
import { formatDate } from "@/lib/markdown";
import type { Project, Community } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

function projectBadge(p: ProjectView): string | null {
  if (p.confidential) return "confidential";
  if (p.hackathon) return String(p.hackathon).split(":")[0];
  return null;
}

export default async function Home() {
  // getExperiences is only here to start NowPanel's read alongside the others.
  const [siteConfig, posts, projects, communities, emojiRows, admin] = await Promise.all([
    getSiteConfig(),
    getPublishedPosts(),
    getProjects(),
    getCommunities(),
    getEmojis(),
    isAdmin(),
    getExperiences(),
  ]);
  const feed = posts.slice(0, 6);
  const topProjects = projects.slice(0, 4);
  const emojis = toEmojiMap(emojiRows);

  // Admin-only DB rows (keyed by extId) so inline controls have full records.
  const projectByExtId = new Map<string, Project>();
  const communityByExtId = new Map<string, Community>();
  if (admin) {
    try {
      const [projectRows, communityRows] = await Promise.all([getAllProjects(), getAllCommunities()]);
      for (const row of projectRows) projectByExtId.set(row.extId, row);
      for (const row of communityRows) communityByExtId.set(row.extId, row);
    } catch {
      /* DB unavailable — controls simply won't render */
    }
  }

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
          <NowPanel />

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
              <NewPostButton className="edit-mini" />
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
                      <Link href={`/writing/${post.slug}`}>
                        <RichTitle text={post.title} emojis={emojis} />
                      </Link>
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
                          <img src={post.cover} alt="" loading={i < 2 ? undefined : "lazy"} />
                        </div>
                      )}
                      <div>
                        {post.excerpt && <p>{post.excerpt}</p>}
                        <Link className="more" href={`/writing/${post.slug}`}>
                          continue reading »
                        </Link>
                        <PostEditButton post={post} />
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
              <NewProjectButton className="edit-mini" />
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
                    <ProjectControls item={projectByExtId.get(p.id)} />
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
              <NewCommunityButton className="edit-mini" />
            </div>
            <div className="pb" style={{ padding: "8px 12px 15px" }}>
              {communities.map((c) => (
                <div className="plink" key={c.id}>
                  <Link href="/about">{c.name}</Link>
                  <span className="d">{c.description.split(".")[0]}.</span>
                  <CommunityControls item={communityByExtId.get(c.id)} />
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
