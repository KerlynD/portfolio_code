import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import ProjectsBoard from "@/components/projects/ProjectsBoard";
import { getBuildSha } from "@/lib/build";
import { getProjects, getSiteConfig } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const siteConfig = await getSiteConfig();
  return { title: `Projects | ${siteConfig.name}` };
}

export default async function ProjectsPage() {
  const siteConfig = await getSiteConfig();
  const projects = await getProjects();
  const wins = projects.filter((p) => p.hackathon).slice(0, 3);

  return (
    <div className="shell">
      <SiteHeader
        active="projects"
        ghost={["PROJ", "ECTS"]}
        readoutTop={`repos :: ${projects.length} shipped`}
        ticker={
          projects.length
            ? [
                `${projects.length} projects shipped`,
                ...wins.map((p) => `${p.name} — ${p.hackathon}`),
              ]
            : ["no projects yet"]
        }
        build={getBuildSha()}
      />

      <ProjectsBoard projects={projects} links={siteConfig.links} />

      <SiteFooter page="projects" />
    </div>
  );
}
