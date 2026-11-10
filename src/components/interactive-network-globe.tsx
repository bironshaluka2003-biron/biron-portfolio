"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import * as THREE from "three";

const GLOBE_RADIUS = 1.45;
const SATELLITE_ORBIT_X = 1.92;
const SATELLITE_ORBIT_Y = 1.78;
const INTRO_EXIT_DURATION = 950;

const INTRO_HUBS = [
  [6.9271, 79.8612], [1.3521, 103.8198], [35.6762, 139.6503], [19.076, 72.8777],
  [25.2048, 55.2708], [51.5072, -0.1276], [50.1109, 8.6821], [40.7128, -74.006],
  [37.7749, -122.4194], [-33.8688, 151.2093],
] as const;
const INTRO_ROUTES = [[0,1],[0,3],[0,4],[1,2],[1,9],[1,8],[2,6],[3,6],[4,5],[5,6],[5,7],[6,2],[7,8]] as const;

function smoothStep(value: number) {
  const t = THREE.MathUtils.clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
}

function introPoint(latitude: number, longitude: number, radius: number) {
  const lat = THREE.MathUtils.degToRad(latitude);
  const lon = THREE.MathUtils.degToRad(longitude);
  return new THREE.Vector3(radius * Math.cos(lat) * Math.cos(lon), radius * Math.sin(lat), -radius * Math.cos(lat) * Math.sin(lon));
}

function createIntroNetwork(globeGroup: THREE.Group) {
  const nodeGeometry = new THREE.SphereGeometry(0.026, 12, 10);
  const nodes = INTRO_HUBS.map(([latitude, longitude], index) => {
    const material = new THREE.MeshBasicMaterial({ color: 0x91f5e9, toneMapped: false, transparent: true, opacity: 0, depthWrite: false });
    const node = new THREE.Mesh(nodeGeometry, material);
    node.position.copy(introPoint(latitude, longitude, GLOBE_RADIUS + 0.026));
    node.scale.setScalar(0.001);
    node.userData.introIndex = index;
    globeGroup.add(node);
    return { node, material };
  });

  const arcs = INTRO_ROUTES.map(([from, to], index) => {
    const [fromLatitude, fromLongitude] = INTRO_HUBS[from];
    const [toLatitude, toLongitude] = INTRO_HUBS[to];
    const start = introPoint(fromLatitude, fromLongitude, GLOBE_RADIUS * 1.006);
    const end = introPoint(toLatitude, toLongitude, GLOBE_RADIUS * 1.006);
    const angle = start.angleTo(end);
    const control = start.clone().add(end).normalize().multiplyScalar(GLOBE_RADIUS * (1.04 + angle * 0.1));
    const curve = new THREE.QuadraticBezierCurve3(start, control, end);
    const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(56));
    geometry.setDrawRange(0, 0);
    const material = new THREE.LineBasicMaterial({ color: 0x18c6c0, transparent: true, opacity: 0, depthWrite: false });
    const line = new THREE.Line(geometry, material);
    line.renderOrder = 2;
    globeGroup.add(line);
    return { curve, geometry, material, index };
  });

  const packetGeometry = new THREE.SphereGeometry(0.014, 8, 6);
  const packetMaterial = new THREE.MeshBasicMaterial({ color: 0xb2fff4, toneMapped: false, transparent: true, opacity: 0, depthWrite: false });
  const packets = arcs.slice(0, 8).map((arc, index) => {
    const packet = new THREE.Mesh(packetGeometry, packetMaterial);
    packet.userData.routeIndex = index;
    packet.userData.offset = index / 8;
    globeGroup.add(packet);
    return packet;
  });

  return {
    update(elapsed: number, opacity: number) {
      const fade = opacity * (1 - smoothStep((elapsed - 4.45) / 0.85));
      nodes.forEach(({ node, material }, index) => {
        const reveal = smoothStep((elapsed - 0.8 - index * 0.035) / 0.72);
        const dissolve = 1 - smoothStep((elapsed - 4.05 - index * 0.025) / 0.56);
        const pulse = 1 + Math.sin(elapsed * 2.1 + index * 0.83) * 0.12;
        node.scale.setScalar(Math.max(0.001, reveal * pulse));
        material.opacity = reveal * fade * dissolve;
      });
      arcs.forEach((arc) => {
        const reveal = smoothStep((elapsed - 1.15 - arc.index * 0.022) / 0.78);
        const dissolve = 1 - smoothStep((elapsed - 3.95 - arc.index * 0.035) / 0.58);
        arc.geometry.setDrawRange(0, Math.max(0, Math.floor(57 * reveal)));
        arc.material.opacity = reveal * 0.43 * fade * dissolve;
      });
      packetMaterial.opacity = fade;
      packets.forEach((packet, index) => {
        const route = arcs[packet.userData.routeIndex as number];
        const progress = (elapsed * 0.17 + packet.userData.offset) % 1;
        packet.position.copy(route.curve.getPoint(progress));
        packet.visible = elapsed > 2.05 + index * 0.08 && fade > 0.01;
      });
    },
  };
}

type GeoPoint = [number, number];
type GeoRing = GeoPoint[];
type GeoPolygon = GeoRing[];
type BoundaryFeature = {
  n?: string;
  i?: string | null;
  z?: string;
  b: [number, number, number, number];
  p: GeoPolygon[];
  polygonBounds?: Array<[number, number, number, number]>;
};
type GlobeGeoData = { countries: BoundaryFeature[]; timezones: BoundaryFeature[] };
type CountryTooltipData = { id: string; name: string; flag: string; timeZone: string | null };
type PointerLookupRequest = { x: number; y: number; touchTap: boolean };

let globeGeoDataPromise: Promise<GlobeGeoData> | null = null;
const reportedTimezoneErrors = new Set<string>();
const reportedMissingTimezoneCountries = new Set<string>();

async function loadGeoCollection(path: string, label: string): Promise<{ features: BoundaryFeature[] }> {
  const response = await fetch(path, { cache: "force-cache" });
  if (!response.ok) {
    throw new Error(`${label} request failed (${response.status} ${response.statusText}) at ${path}`);
  }

  let collection: unknown;
  try {
    collection = await response.json();
  } catch (error) {
    throw new Error(`${label} response was not valid JSON at ${path}`, { cause: error });
  }

  if (!collection || typeof collection !== "object" || !("features" in collection) || !Array.isArray(collection.features) || collection.features.length === 0) {
    throw new Error(`${label} data is missing its non-empty features array at ${path}`);
  }
  return collection as { features: BoundaryFeature[] };
}

function polygonBounds(polygon: GeoPolygon): [number, number, number, number] {
  let west = 180;
  let south = 90;
  let east = -180;
  let north = -90;
  polygon.forEach((ring) => ring.forEach(([longitude, latitude]) => {
    west = Math.min(west, longitude);
    south = Math.min(south, latitude);
    east = Math.max(east, longitude);
    north = Math.max(north, latitude);
  }));
  return [west, south, east, north];
}

async function loadGlobeGeoData(): Promise<GlobeGeoData> {
  if (!globeGeoDataPromise) {
    globeGeoDataPromise = Promise.all([
      loadGeoCollection("/geodata/countries.json", "Country boundary data"),
      loadGeoCollection("/geodata/timezones.json", "Timezone boundary data"),
    ]).then(([countryCollection, timezoneCollection]) => {
      const prepare = (features: BoundaryFeature[]) => features.map((feature) => ({
        ...feature,
        polygonBounds: feature.p.map(polygonBounds),
      }));
      const invalidCountry = countryCollection.features.find((feature) => !feature.n || !Array.isArray(feature.p) || !Array.isArray(feature.b));
      const invalidTimezone = timezoneCollection.features.find((feature) => !feature.z || !Array.isArray(feature.p) || !Array.isArray(feature.b));
      if (invalidCountry) throw new Error("Country boundary data contains a feature without a name or valid polygon data.");
      if (invalidTimezone) throw new Error("Timezone boundary data contains a feature without an IANA timezone or valid polygon data.");
      return {
        countries: prepare(countryCollection.features),
        timezones: prepare(timezoneCollection.features),
      };
    }).catch((error) => {
      globeGeoDataPromise = null;
      console.error("[network globe] Geographic data could not be loaded. Confirm public/geodata/countries.json and public/geodata/timezones.json are included in the deployment.", error);
      throw error;
    });
  }
  return globeGeoDataPromise;
}

function wrappedLongitudeDelta(longitude: number) {
  return ((longitude + 540) % 360) - 180;
}

function longitudeInBounds(longitude: number, west: number, east: number) {
  const tolerance = 0.00005;
  return [longitude, longitude - 360, longitude + 360].some((value) => value >= west - tolerance && value <= east + tolerance);
}

function pointInRing(longitude: number, latitude: number, ring: GeoRing) {
  let inside = false;
  const edgeTolerance = 0.000025;

  for (let current = 0, previous = ring.length - 1; current < ring.length; previous = current, current += 1) {
    const currentPoint = ring[current];
    const previousPoint = ring[previous];
    const x1 = wrappedLongitudeDelta(previousPoint[0] - longitude);
    const x2 = wrappedLongitudeDelta(currentPoint[0] - longitude);
    const y1 = previousPoint[1];
    const y2 = currentPoint[1];
    const dx = x2 - x1;
    const dy = y2 - y1;
    const cross = Math.abs(dx * (latitude - y1) - dy * -x1);
    const edgeLength = Math.hypot(dx, dy);
    const dot = -x1 * dx + (latitude - y1) * dy;
    if (edgeLength > 0 && cross <= edgeTolerance * edgeLength && dot >= -edgeTolerance && dot <= dx * dx + dy * dy + edgeTolerance) {
      return true;
    }

    if ((y1 > latitude) !== (y2 > latitude)) {
      const crossingX = x1 + ((latitude - y1) * dx) / dy;
      if (crossingX > 0) inside = !inside;
    }
  }

  return inside;
}

function pointInFeature(longitude: number, latitude: number, feature: BoundaryFeature) {
  const [west, south, east, north] = feature.b;
  if (latitude < south - 0.00005 || latitude > north + 0.00005 || !longitudeInBounds(longitude, west, east)) return false;

  for (let index = 0; index < feature.p.length; index += 1) {
    const [polygonWest, polygonSouth, polygonEast, polygonNorth] = feature.polygonBounds?.[index] ?? feature.b;
    if (latitude < polygonSouth - 0.00005 || latitude > polygonNorth + 0.00005 || !longitudeInBounds(longitude, polygonWest, polygonEast)) continue;

    const polygon = feature.p[index];
    if (!polygon[0] || !pointInRing(longitude, latitude, polygon[0])) continue;
    if (polygon.slice(1).some((hole) => pointInRing(longitude, latitude, hole))) continue;
    return true;
  }
  return false;
}

function findFeature(longitude: number, latitude: number, features: BoundaryFeature[]) {
  return features.find((feature) => pointInFeature(longitude, latitude, feature)) ?? null;
}

function flagEmoji(isoCode?: string | null) {
  if (!isoCode || !/^[a-z]{2}$/i.test(isoCode)) return "🏳️";
  return String.fromCodePoint(...isoCode.toUpperCase().split("").map((letter) => 127397 + letter.charCodeAt(0)));
}

function getLocalClock(timeZone: string | null, now: number) {
  if (!timeZone) return null;
  const date = new Date(now);
  try {
    const time = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(date);
    const localDate = new Intl.DateTimeFormat("en-US", {
      timeZone,
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
    const offsetName = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "longOffset",
      hour: "2-digit",
    }).formatToParts(date).find((part) => part.type === "timeZoneName")?.value ?? "GMT";
    const offsetMatch = offsetName.match(/^GMT([+-])(\d{1,2}):(\d{2})$/);
    const offset = offsetMatch
      ? `UTC${offsetMatch[1]}${offsetMatch[2].padStart(2, "0")}:${offsetMatch[3]}`
      : offsetName === "GMT" ? "UTC+00:00" : `UTC${offsetName.replace(/^GMT/, "")}`;
    return { date: localDate, time, offset };
  } catch (error) {
    if (!reportedTimezoneErrors.has(timeZone)) {
      reportedTimezoneErrors.add(timeZone);
      console.error(`[network globe] Invalid or unsupported IANA timezone "${timeZone}" in timezone boundary data.`, error);
    }
    return null;
  }
}

function popupPosition(clientX: number, clientY: number, width: number, height: number) {
  const margin = 8;
  let left = clientX + 14;
  let top = clientY + 14;
  if (left + width > window.innerWidth - margin) left = clientX - width - 14;
  if (top + height > window.innerHeight - margin) top = clientY - height - 14;
  return {
    left: Math.max(margin, Math.min(left, window.innerWidth - width - margin)),
    top: Math.max(margin, Math.min(top, window.innerHeight - height - margin)),
  };
}

function createSatellite() {
  const satellite = new THREE.Group();
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x183a3b,
    metalness: 0.82,
    roughness: 0.3,
  });
  const silverMaterial = new THREE.MeshStandardMaterial({
    color: 0xa3b8b5,
    metalness: 0.78,
    roughness: 0.26,
  });
  const panelMaterial = new THREE.MeshStandardMaterial({
    color: 0x102b2d,
    emissive: 0x071416,
    metalness: 0.56,
    roughness: 0.42,
  });
  const panelGridMaterial = new THREE.LineBasicMaterial({
    color: 0x28746d,
    transparent: true,
    opacity: 0.78,
    depthWrite: false,
  });
  const indicatorMaterial = new THREE.MeshBasicMaterial({
    color: 0x91f5e9,
    toneMapped: false,
  });

  satellite.add(new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.085, 0.105), bodyMaterial));
  const centerBand = new THREE.Mesh(new THREE.BoxGeometry(0.126, 0.018, 0.11), silverMaterial);
  centerBand.position.y = 0.014;
  satellite.add(centerBand);

  const panelGeometry = new THREE.BoxGeometry(0.155, 0.105, 0.012);
  const panelGridPoints: THREE.Vector3[] = [];
  for (let column = 1; column <= 3; column += 1) {
    const x = -0.0775 + (column / 4) * 0.155;
    panelGridPoints.push(new THREE.Vector3(x, -0.051, 0.008), new THREE.Vector3(x, 0.051, 0.008));
  }
  for (let row = 1; row <= 2; row += 1) {
    const y = -0.0525 + (row / 3) * 0.105;
    panelGridPoints.push(new THREE.Vector3(-0.0775, y, 0.008), new THREE.Vector3(0.0775, y, 0.008));
  }
  const panelGridGeometry = new THREE.BufferGeometry().setFromPoints(panelGridPoints);

  for (const side of [-1, 1]) {
    const panel = new THREE.Mesh(panelGeometry, panelMaterial);
    panel.position.x = side * 0.16;
    satellite.add(panel);

    const grid = new THREE.LineSegments(panelGridGeometry, panelGridMaterial);
    grid.position.x = side * 0.16;
    satellite.add(grid);

    const support = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.009, 0.018), silverMaterial);
    support.position.x = side * 0.105;
    satellite.add(support);
  }

  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.004, 0.065, 6), silverMaterial);
  antenna.position.set(0.035, 0.068, 0);
  satellite.add(antenna);

  const indicator = new THREE.Mesh(new THREE.SphereGeometry(0.009, 8, 8), indicatorMaterial);
  indicator.position.set(0.035, 0.104, 0);
  satellite.add(indicator);

  return satellite;
}

function collectSceneResources(root: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();

  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.LineLoop || object instanceof THREE.LineSegments)) return;
    geometries.add(object.geometry);
    const attached = Array.isArray(object.material) ? object.material : [object.material];
    attached.forEach((material) => materials.add(material));
  });

  return { geometries, materials };
}

export default function InteractiveNetworkGlobe() {
  const pathname = usePathname();
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef({ x: 0, y: 0, overGlobe: false });
  const dragRef = useRef<{ pointerId: number; startX: number; startY: number; lastX: number; lastY: number; moved: boolean } | null>(null);
  const rotationRef = useRef({ x: 0, y: 0 });
  const requestRenderRef = useRef<(() => void) | null>(null);
  const countryLookupRef = useRef<((request: PointerLookupRequest) => void) | null>(null);
  const cancelCountryLookupRef = useRef<(() => void) | null>(null);
  const dismissTooltipRef = useRef<(() => void) | null>(null);
  const pendingLookupRef = useRef<PointerLookupRequest | null>(null);
  const pointerFrameRef = useRef(0);
  const currentTooltipRef = useRef<CountryTooltipData | null>(null);
  const touchPopupPinnedRef = useRef(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [runtimeMode, setRuntimeMode] = useState<"hidden" | "intro" | "morphing" | "home" | "exiting">("hidden");
  const runtimeModeRef = useRef(runtimeMode);
  const [countryTooltip, setCountryTooltip] = useState<CountryTooltipData | null>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ left: 0, top: 0 });
  const [clockNow, setClockNow] = useState(() => Date.now());

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const root = document.documentElement;
    let exitStarted = false;
    let exitTimer = 0;
    let placementFrame = 0;
    let transitionFrame = 0;
    let followFrame = 0;

    const targetElement = () => document.querySelector<HTMLElement>("[data-network-globe-target]");
    const setMode = (mode: typeof runtimeMode) => {
      if (mode !== "home") {
        pointerRef.current.overGlobe = false;
        dragRef.current = null;
        touchPopupPinnedRef.current = false;
        cancelCountryLookupRef.current?.();
        dismissTooltipRef.current?.();
      }
      runtimeModeRef.current = mode;
      setRuntimeMode(mode);
    };
    const setBounds = (rect: DOMRect) => {
      stage.style.left = `${rect.left}px`;
      stage.style.top = `${rect.top}px`;
      stage.style.width = `${rect.width}px`;
      stage.style.height = `${rect.height}px`;
    };
    const followTarget = () => {
      if (runtimeModeRef.current !== "home") return;
      if (followFrame) return;
      followFrame = window.requestAnimationFrame(() => {
        followFrame = 0;
        if (runtimeModeRef.current !== "home") return;
        const target = targetElement();
        if (target) setBounds(target.getBoundingClientRect());
      });
    };
    const place = () => {
      const target = targetElement();
      const phaseIsExit = root.dataset.portfolioIntroPhase === "exit";

      if (phaseIsExit && exitStarted) {
        if (runtimeModeRef.current === "morphing" && target && pathname === "/") {
          setBounds(target.getBoundingClientRect());
        }
        return;
      }

      if (phaseIsExit && !exitStarted) {
        exitStarted = true;
        const destination = target?.getBoundingClientRect();
        if (destination && pathname === "/") {
          setMode("morphing");
          stage.style.transition = `left ${INTRO_EXIT_DURATION}ms cubic-bezier(.22,.75,.25,1), top ${INTRO_EXIT_DURATION}ms cubic-bezier(.22,.75,.25,1), width ${INTRO_EXIT_DURATION}ms cubic-bezier(.22,.75,.25,1), height ${INTRO_EXIT_DURATION}ms cubic-bezier(.22,.75,.25,1)`;
          transitionFrame = window.requestAnimationFrame(() => setBounds(destination));
          window.clearTimeout(exitTimer);
          exitTimer = window.setTimeout(() => {
            if (runtimeModeRef.current !== "morphing") return;
            stage.style.transition = "none";
            setMode("home");
            followTarget();
          }, INTRO_EXIT_DURATION + 30);
        } else {
          setMode("exiting");
          stage.style.transition = `opacity ${INTRO_EXIT_DURATION}ms ease`;
          stage.style.opacity = "0";
        }
        return;
      }

      if (root.dataset.portfolioIntroActive === "true") {
        if (exitStarted) return;
        setMode("intro");
        stage.style.transition = "none";
        stage.style.opacity = "1";
        setBounds(new DOMRect(0, 0, window.innerWidth, window.innerHeight));
        return;
      }

      if (!root.dataset.portfolioIntroActive && exitStarted) {
        exitStarted = false;
        stage.style.transition = "none";
        stage.style.opacity = "1";
      }
      if (target && pathname === "/") {
        stage.style.transition = "none";
        setMode("home");
        setBounds(target.getBoundingClientRect());
      } else {
        setMode("hidden");
      }
    };

    const schedulePlace = () => {
      if (placementFrame) window.cancelAnimationFrame(placementFrame);
      placementFrame = window.requestAnimationFrame(place);
    };
    const handleScroll = () => {
      if (runtimeModeRef.current === "home") followTarget();
      else if (runtimeModeRef.current === "morphing") schedulePlace();
    };
    const observer = new MutationObserver(schedulePlace);
    observer.observe(root, { attributes: true, attributeFilter: ["data-portfolio-intro-active", "data-portfolio-intro-phase"] });
    const bodyObserver = new MutationObserver(schedulePlace);
    bodyObserver.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("resize", schedulePlace);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.visualViewport?.addEventListener("resize", schedulePlace);
    schedulePlace();

    return () => {
      observer.disconnect();
      bodyObserver.disconnect();
      window.removeEventListener("resize", schedulePlace);
      window.removeEventListener("scroll", handleScroll);
      window.visualViewport?.removeEventListener("resize", schedulePlace);
      if (placementFrame) window.cancelAnimationFrame(placementFrame);
      if (transitionFrame) window.cancelAnimationFrame(transitionFrame);
      if (followFrame) window.cancelAnimationFrame(followFrame);
      window.clearTimeout(exitTimer);
    };
  }, [pathname]);

  const queueCountryLookup = (request: PointerLookupRequest) => {
    pendingLookupRef.current = request;
    if (pointerFrameRef.current !== 0) return;
    pointerFrameRef.current = window.requestAnimationFrame(() => {
      pointerFrameRef.current = 0;
      const latest = pendingLookupRef.current;
      pendingLookupRef.current = null;
      if (latest) countryLookupRef.current?.(latest);
    });
  };

  useEffect(() => {
    if (!countryTooltip || !tooltipVisible) return;
    const interval = window.setInterval(() => setClockNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [countryTooltip, tooltipVisible]);

  useEffect(() => {
    const dismissOutside = (event: PointerEvent) => {
      if (!touchPopupPinnedRef.current || stageRef.current?.contains(event.target as Node)) return;
      cancelCountryLookupRef.current?.();
      dismissTooltipRef.current?.();
    };
    document.addEventListener("pointerdown", dismissOutside, true);
    return () => document.removeEventListener("pointerdown", dismissOutside, true);
  }, []);

  useEffect(() => () => {
    if (pointerFrameRef.current !== 0) window.cancelAnimationFrame(pointerFrameRef.current);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;

    let renderer: THREE.WebGLRenderer;
    let mapTexture: THREE.Texture | null = null;
    let disposed = false;

    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
        failIfMajorPerformanceCaveat: false,
      });
    } catch {
      setUnavailable(true);
      return;
    }

    setUnavailable(false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 600 ? 1.15 : 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
    camera.position.set(0, 0, 6.4);

    scene.add(new THREE.AmbientLight(0xa3b8b5, 1.05));
    const keyLight = new THREE.PointLight(0x18c6c0, 18, 12);
    keyLight.position.set(-3.2, 2.8, 4.5);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight(0x20d8ce, 9, 12);
    rimLight.position.set(3.4, -1.8, -2.5);
    scene.add(rimLight);
    const fillLight = new THREE.PointLight(0x102b2d, 5, 9);
    fillLight.position.set(2.4, 2.2, 3);
    scene.add(fillLight);

    const sceneRoot = new THREE.Group();
    scene.add(sceneRoot);
    const globeGroup = new THREE.Group();
    globeGroup.rotation.y = Math.PI;
    sceneRoot.add(globeGroup);

    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x102b2d,
      emissiveIntensity: 0.2,
      metalness: 0.28,
      roughness: 0.68,
    });
    const globeSurface = new THREE.Mesh(
      new THREE.SphereGeometry(GLOBE_RADIUS, 64, 48),
      sphereMaterial,
    );
    globeGroup.add(globeSurface);

    mapTexture = new THREE.TextureLoader().load(
      "/world-map.svg",
      (texture) => {
        if (disposed) {
          texture.dispose();
          return;
        }
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
        texture.generateMipmaps = true;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        sphereMaterial.map = texture;
        sphereMaterial.needsUpdate = true;
        requestRenderRef.current?.();
      },
      undefined,
      () => {
        // The dark ocean material remains as a graceful fallback if the local map cannot load.
      },
    );

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(GLOBE_RADIUS + 0.08, 48, 36),
      new THREE.MeshBasicMaterial({
        color: 0x20d8ce,
        side: THREE.BackSide,
        transparent: true,
        opacity: 0.12,
        depthWrite: false,
      }),
    );
    globeGroup.add(atmosphere);

    const satelliteOrbit = new THREE.Group();
    satelliteOrbit.rotation.set(0.95, 0.18, -0.3);
    globeGroup.add(satelliteOrbit);

    const orbitPoints = Array.from({ length: 160 }, (_, index) => {
      const angle = (index / 160) * Math.PI * 2;
      return new THREE.Vector3(
        SATELLITE_ORBIT_X * Math.cos(angle),
        SATELLITE_ORBIT_Y * Math.sin(angle),
        0,
      );
    });
    const orbitPath = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(orbitPoints),
      new THREE.LineBasicMaterial({
        color: 0x24615c,
        transparent: true,
        opacity: 0.23,
        depthWrite: false,
      }),
    );
    satelliteOrbit.add(orbitPath);

    const satellite = createSatellite();
    satelliteOrbit.add(satellite);
    const introNetwork = createIntroNetwork(globeGroup);
    const tangent = new THREE.Vector3();
    const right = new THREE.Vector3();
    const up = new THREE.Vector3();
    const orbitNormal = new THREE.Vector3(0, 0, 1);
    const orientation = new THREE.Matrix4();
    const orientSatellite = (angle: number) => {
      const cosine = Math.cos(angle);
      const sine = Math.sin(angle);
      satellite.position.set(SATELLITE_ORBIT_X * cosine, SATELLITE_ORBIT_Y * sine, 0);
      tangent.set(-SATELLITE_ORBIT_X * sine, SATELLITE_ORBIT_Y * cosine, 0).normalize();
      right.crossVectors(orbitNormal, tangent).normalize();
      up.crossVectors(tangent, right).normalize();
      orientation.makeBasis(right, up, tangent);
      satellite.quaternion.setFromRotationMatrix(orientation);
    };
    orientSatellite(0);

    const { geometries, materials } = collectSceneResources(scene);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduceMotion = reducedMotion.matches;
    let visible = false;
    let stageInViewport = false;
    let frameId = 0;
    let previousTime = 0;
    let elapsed = 0;
    let introExitStartedAt: number | null = null;
    const raycaster = new THREE.Raycaster();
    const rayPointer = new THREE.Vector2();
    let geoData: GlobeGeoData | null = null;
    let geoDataLoading = false;
    let pendingGeoRequest: PointerLookupRequest | null = null;

    const hideTooltip = () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
      hideTimerRef.current = null;
      setTooltipVisible(false);
      touchPopupPinnedRef.current = false;
      clearTimerRef.current = setTimeout(() => {
        currentTooltipRef.current = null;
        setCountryTooltip(null);
        clearTimerRef.current = null;
      }, 180);
    };

    const queueTooltipHide = () => {
      if (hideTimerRef.current) return;
      hideTimerRef.current = setTimeout(hideTooltip, 70);
    };

    const placeTooltip = (clientX: number, clientY: number) => {
      const tooltip = tooltipRef.current;
      const position = popupPosition(clientX, clientY, tooltip?.offsetWidth || 208, tooltip?.offsetHeight || 108);
      if (tooltip) {
        tooltip.style.left = `${position.left}px`;
        tooltip.style.top = `${position.top}px`;
      } else {
        setTooltipPosition(position);
      }
    };

    const showTooltip = (country: BoundaryFeature, timezone: BoundaryFeature | null, request: PointerLookupRequest) => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
      hideTimerRef.current = null;
      clearTimerRef.current = null;
      const name = country.n;
      const timeZone = timezone?.z ?? null;
      if (!name) return;
      if (!timeZone && !reportedMissingTimezoneCountries.has(country.n ?? "unknown")) {
        reportedMissingTimezoneCountries.add(country.n ?? "unknown");
        console.error(`[network globe] No timezone boundary matched ${country.n}; showing the country without local time. Check that public/geodata/timezones.json covers this location.`);
      }
      const nextTooltip = {
        id: `${country.i ?? name}:${timeZone}`,
        name,
        flag: flagEmoji(country.i),
        timeZone,
      };
      if (currentTooltipRef.current?.id !== nextTooltip.id) {
        currentTooltipRef.current = nextTooltip;
        setCountryTooltip(nextTooltip);
      }
      setTooltipVisible(true);
      placeTooltip(request.x, request.y);
    };

    const lookupPointer = (request: PointerLookupRequest) => {
      const bounds = stage.getBoundingClientRect();
      if (request.x < bounds.left || request.x > bounds.right || request.y < bounds.top || request.y > bounds.bottom) {
        pointerRef.current.overGlobe = false;
        if (request.touchTap) hideTooltip();
        else queueTooltipHide();
        return;
      }

      rayPointer.set(
        ((request.x - bounds.left) / bounds.width) * 2 - 1,
        -(((request.y - bounds.top) / bounds.height) * 2 - 1),
      );
      scene.updateMatrixWorld(true);
      camera.updateMatrixWorld(true);
      raycaster.setFromCamera(rayPointer, camera);
      const intersection = raycaster.intersectObject(globeSurface, false)[0];
      pointerRef.current.overGlobe = Boolean(intersection) && !request.touchTap;
      if (!intersection) {
        if (request.touchTap) hideTooltip();
        else queueTooltipHide();
        return;
      }

      const localPoint = globeGroup.worldToLocal(intersection.point.clone());
      const latitude = THREE.MathUtils.radToDeg(Math.asin(THREE.MathUtils.clamp(localPoint.y / GLOBE_RADIUS, -1, 1)));
      const longitude = THREE.MathUtils.radToDeg(Math.atan2(-localPoint.z, localPoint.x));

      if (!geoData) {
        pendingGeoRequest = request;
        if (!geoDataLoading) {
          geoDataLoading = true;
          void loadGlobeGeoData().then((loadedData) => {
            geoDataLoading = false;
            if (disposed) return;
            geoData = loadedData;
            const latestRequest = pendingGeoRequest;
            pendingGeoRequest = null;
            if (latestRequest) lookupPointer(latestRequest);
          }).catch(() => {
            geoDataLoading = false;
            pendingGeoRequest = null;
            if (!disposed) queueTooltipHide();
          });
        }
        return;
      }

      const country = findFeature(longitude, latitude, geoData.countries);
      if (!country) {
        if (request.touchTap) hideTooltip();
        else queueTooltipHide();
        return;
      }
      const timezone = findFeature(longitude, latitude, geoData.timezones);
      showTooltip(country, timezone, request);
    };

    countryLookupRef.current = lookupPointer;
    cancelCountryLookupRef.current = () => {
      pendingGeoRequest = null;
      pendingLookupRef.current = null;
      if (pointerFrameRef.current !== 0) {
        window.cancelAnimationFrame(pointerFrameRef.current);
        pointerFrameRef.current = 0;
      }
    };
    dismissTooltipRef.current = hideTooltip;

    const resize = () => {
      const { width, height } = stage.getBoundingClientRect();
      if (width < 1 || height < 1) return;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, width < 600 ? 1.15 : 1.5);
      if (Math.abs(renderer.getPixelRatio() - pixelRatio) > 0.01) renderer.setPixelRatio(pixelRatio);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      requestRenderRef.current?.();
    };

    const renderFrame = (time: number) => {
      frameId = 0;
      if (!visible) return;

      const delta = previousTime === 0 ? 0 : Math.min((time - previousTime) / 1000, 0.05);
      previousTime = time;
      elapsed += delta;

      const introRoot = document.documentElement;
      const introActive = introRoot.dataset.portfolioIntroActive === "true";
      const introExiting = introRoot.dataset.portfolioIntroPhase === "exit";
      if (introExiting && introExitStartedAt === null) introExitStartedAt = time;
      const exitFade = introExitStartedAt === null ? 0 : smoothStep((time - introExitStartedAt) / INTRO_EXIT_DURATION);
      introNetwork.update(elapsed, introActive ? (introExiting ? 1 - exitFade : 1) : 0);

      if (!reduceMotion) {
        satellite.position.set(
          SATELLITE_ORBIT_X * Math.cos(elapsed * 0.24),
          SATELLITE_ORBIT_Y * Math.sin(elapsed * 0.24),
          0,
        );
        tangent.set(
          -SATELLITE_ORBIT_X * Math.sin(elapsed * 0.24),
          SATELLITE_ORBIT_Y * Math.cos(elapsed * 0.24),
          0,
        ).normalize();
        right.crossVectors(orbitNormal, tangent).normalize();
        up.crossVectors(tangent, right).normalize();
        orientation.makeBasis(right, up, tangent);
        satellite.quaternion.setFromRotationMatrix(orientation);
      }

      if (!pointerRef.current.overGlobe) {
        globeGroup.rotation.y += delta * (reduceMotion ? 0 : 0.075);
      }
      if (!pointerRef.current.overGlobe || dragRef.current) {
        const targetRootX = pointerRef.current.y * 0.055 + rotationRef.current.x;
        const targetRootY = pointerRef.current.x * 0.09 + rotationRef.current.y;
        sceneRoot.rotation.x += (targetRootX - sceneRoot.rotation.x) * (reduceMotion ? 1 : 0.055);
        sceneRoot.rotation.y += (targetRootY - sceneRoot.rotation.y) * (reduceMotion ? 1 : 0.055);
      }

      renderer.render(scene, camera);
      if (!reduceMotion) frameId = window.requestAnimationFrame(renderFrame);
    };

    requestRenderRef.current = () => {
      if (visible && frameId === 0) frameId = window.requestAnimationFrame(renderFrame);
    };

    const syncRenderVisibility = () => {
      const shouldRender = stageInViewport ||
        document.documentElement.dataset.portfolioIntroActive === "true" ||
        runtimeModeRef.current === "morphing";
      if (visible === shouldRender) return;
      visible = shouldRender;
      if (visible) {
        previousTime = 0;
        requestRenderRef.current?.();
      } else if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
      }
    };

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      stageInViewport = entry.isIntersecting;
      syncRenderVisibility();
    }, { threshold: 0.01 });
    intersectionObserver.observe(stage);

    const introObserver = new MutationObserver(syncRenderVisibility);
    introObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-portfolio-intro-active", "data-portfolio-intro-phase"],
    });

    const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    resizeObserver?.observe(stage);
    window.addEventListener("resize", resize);

    const handleWheel = (event: WheelEvent) => {
      // Let normal wheel input scroll the document. Keep globe zoom available
      // for an explicit modified-wheel gesture (also used by trackpad pinch).
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      camera.position.z = THREE.MathUtils.clamp(camera.position.z + event.deltaY * 0.003, 4.9, 8.4);
      requestRenderRef.current?.();
    };
    stage.addEventListener("wheel", handleWheel, { passive: false });
    resize();

    const handleReducedMotion = (event: MediaQueryListEvent) => {
      reduceMotion = event.matches;
      previousTime = 0;
      requestRenderRef.current?.();
    };
    reducedMotion.addEventListener("change", handleReducedMotion);

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      setUnavailable(true);
      visible = false;
      if (frameId !== 0) window.cancelAnimationFrame(frameId);
      frameId = 0;
    };
    canvas.addEventListener("webglcontextlost", handleContextLost);

    return () => {
      disposed = true;
      visible = false;
      if (frameId !== 0) window.cancelAnimationFrame(frameId);
      intersectionObserver.disconnect();
      introObserver.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener("resize", resize);
      stage.removeEventListener("wheel", handleWheel);
      reducedMotion.removeEventListener("change", handleReducedMotion);
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      requestRenderRef.current = null;
      countryLookupRef.current = null;
      cancelCountryLookupRef.current = null;
      dismissTooltipRef.current = null;
      pendingGeoRequest = null;
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      mapTexture?.dispose();
      renderer.dispose();
    };
  }, []);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    if (event.pointerType === "touch") touchPopupPinnedRef.current = false;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
      moved: false,
    };
    if (event.pointerType !== "touch") event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerRef.current = {
      x: ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      y: -(((event.clientY - bounds.top) / bounds.height) * 2 - 1),
      overGlobe: pointerRef.current.overGlobe,
    };

    if (event.pointerType === "touch") {
      touchPopupPinnedRef.current = false;
    } else {
      queueCountryLookup({ x: event.clientX, y: event.clientY, touchTap: false });
    }

    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      requestRenderRef.current?.();
      return;
    }

    const deltaX = event.clientX - drag.lastX;
    const deltaY = event.clientY - drag.lastY;
    const totalX = event.clientX - drag.startX;
    const totalY = event.clientY - drag.startY;
    drag.moved ||= Math.hypot(totalX, totalY) > (event.pointerType === "touch" ? 6 : 4);

    if (event.pointerType !== "touch" || Math.abs(totalX) > Math.abs(totalY)) {
      if (drag.moved && event.pointerType === "touch" && !event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.setPointerCapture(event.pointerId);
      }
      if (drag.moved) {
        rotationRef.current.y += deltaX * 0.006;
        rotationRef.current.x = THREE.MathUtils.clamp(rotationRef.current.x + deltaY * 0.006, -1.15, 1.15);
        requestRenderRef.current?.();
      }
    }

    drag.lastX = event.clientX;
    drag.lastY = event.clientY;
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (drag?.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (event.pointerType === "touch") {
      if (!drag.moved) {
        touchPopupPinnedRef.current = true;
        queueCountryLookup({ x: event.clientX, y: event.clientY, touchTap: true });
      } else {
        touchPopupPinnedRef.current = false;
        dismissTooltipRef.current?.();
      }
    }
    dragRef.current = null;
  };

  const handlePointerCancel = () => {
    dragRef.current = null;
    touchPopupPinnedRef.current = false;
  };

  const handlePointerLeave = () => {
    if (touchPopupPinnedRef.current) return;
    pointerRef.current = { x: 0, y: 0, overGlobe: false };
    requestRenderRef.current?.();
    cancelCountryLookupRef.current?.();
    dismissTooltipRef.current?.();
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      rotationRef.current.y += event.key === "ArrowLeft" ? -0.12 : 0.12;
      event.preventDefault();
      requestRenderRef.current?.();
    } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      rotationRef.current.x = THREE.MathUtils.clamp(rotationRef.current.x + (event.key === "ArrowUp" ? 0.12 : -0.12), -1.15, 1.15);
      event.preventDefault();
      requestRenderRef.current?.();
    }
  };

  const localClock = countryTooltip ? getLocalClock(countryTooltip.timeZone, clockNow) : null;

  return (
    <div
      aria-label="Interactive 3D Earth globe"
      className={`network-visualization network-runtime network-runtime-${runtimeMode}${unavailable ? " network-unavailable" : ""}`}
      onKeyDown={handleKeyDown}
      onPointerCancel={handlePointerCancel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      ref={stageRef}
      role="group"
      tabIndex={runtimeMode === "home" ? 0 : -1}
    >
      <canvas aria-hidden="true" className="network-canvas" ref={canvasRef} />
      {countryTooltip && (
        <div
          aria-label={`Local time details for ${countryTooltip.name}`}
          className={`globe-country-tooltip${tooltipVisible ? " is-visible" : ""}`}
          ref={tooltipRef}
          role="group"
          style={{ left: tooltipPosition.left, top: tooltipPosition.top }}
        >
          <div aria-atomic="true" aria-live="polite" className="globe-country-heading">
            <span aria-hidden="true" className="globe-country-flag">{countryTooltip.flag}</span>
            <span className="globe-country-name">{countryTooltip.name}</span>
          </div>
          <time aria-live="off" className="globe-country-date">{localClock?.date ?? "Local date unavailable"}</time>
          <time aria-live="off" className="globe-country-time">{localClock?.time ?? "Local time unavailable"}</time>
          <span aria-live="off" className="globe-country-offset">Local Time · {localClock?.offset ?? "timezone unavailable"}</span>
        </div>
      )}
    </div>
  );
}
