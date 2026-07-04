import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import ProjectsBoard from "@/components/projects/ProjectsBoard";
import { getBuildSha } from "@/lib/build";
import siteConfig from "@/data/siteConfig.json";
import projects from "@/data/projects.json";

export const metadata = { title: `Projects | ${siteConfig.name}` };

export default function ProjectsPage() {
  return (
    <div className="shell">
      <SiteHeader
        active="projects"
        ghost={["PROJ", "ECTS"]}
        readoutTop={`repos :: ${projects.length} shipped`}
        ticker={[
          `${projects.length} projects shipped`,
          "RefuConnect — 2nd @ HopHacks",
          "Code Whisperer — Best Software @ HackKnight",
          "CUNY to Calendar — on the Chrome store",
        ]}
        build={getBuildSha()}
      />

      <ProjectsBoard />

      <SiteFooter page="projects" />
    </div>
  );
}
