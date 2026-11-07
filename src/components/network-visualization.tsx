"use client";

import dynamic from "next/dynamic";

const InteractiveNetworkGlobe = dynamic(
  () => import("@/components/interactive-network-globe"),
  {
    ssr: false,
    loading: () => (
      <div aria-hidden="true" className="network-visualization network-loading">
        <span className="network-loading-orbit" />
        <span className="network-loading-core" />
        <span className="network-loading-label">INITIALIZING NETWORK</span>
      </div>
    ),
  },
);

export function NetworkVisualization() {
  return <InteractiveNetworkGlobe />;
}
