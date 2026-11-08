import { ViewTransition } from "react";
import { HomeLanding } from "@/components/home-landing";
import { AboutSection } from "@/components/about-section";
import { ProjectsSection } from "@/components/projects-section";
import { CertificationsSection } from "@/components/certifications-section";
import { TechnologiesSection } from "@/components/technologies-section";

export default function Home() {
  return (
    <ViewTransition enter="page-enter" exit="page-exit" default="none">
      <main>
        <HomeLanding />
        <AboutSection />
        <ProjectsSection />
        <CertificationsSection />
        <TechnologiesSection />
      </main>
    </ViewTransition>
  );
}
