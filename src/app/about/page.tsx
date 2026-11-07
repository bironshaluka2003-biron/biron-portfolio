import type { Metadata } from "next";
import { AboutSection } from "@/components/about-section";

export const metadata: Metadata = {
  title: "About | Biron Shaluka",
  description:
    "About Biron Shaluka, SLIIT Information Technology undergraduate specializing in Computer Systems and Network Engineering.",
};

export default function AboutPage() {
  return (
    <main>
      <AboutSection />
    </main>
  );
}
