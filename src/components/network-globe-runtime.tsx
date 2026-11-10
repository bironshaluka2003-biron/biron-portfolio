"use client";

import dynamic from "next/dynamic";

const InteractiveNetworkGlobe = dynamic(
  () => import("@/components/interactive-network-globe"),
  { ssr: false, loading: () => null },
);

export function NetworkGlobeRuntime() {
  return <InteractiveNetworkGlobe />;
}
