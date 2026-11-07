import { ViewTransition } from "react";
import type { Metadata } from "next";
import { CertificationsSection } from "@/components/certifications-section";

export const metadata: Metadata = {
  title: "Certifications & Achievements | Biron Shaluka",
  description:
    "Cisco Networking Academy certifications, digital badges, and learning achievements earned by Biron Shaluka.",
};

export default function CertificationsPage() {
  return (
    <ViewTransition enter="page-enter" exit="page-exit" default="none">
      <main>
        <CertificationsSection />
      </main>
    </ViewTransition>
  );
}
