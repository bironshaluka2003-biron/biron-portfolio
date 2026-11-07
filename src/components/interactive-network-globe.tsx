"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import * as THREE from "three";

type PacketPath = {
  points: THREE.Vector3[];
  speed: number;
  offset: number;
  mesh: THREE.Mesh;
};

type FadedMaterial = {
  material: THREE.Material;
  baseOpacity: number;
};

type NetworkHub = {
  id: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
};

type GlobalRoute = {
  from: string;
  to: string;
  material: THREE.LineBasicMaterial;
  baseColor: number;
  baseOpacity: number;
  packet: PacketPath;
};

type CityMarker = {
  hub: NetworkHub;
  marker: THREE.Mesh;
  glow: THREE.Mesh;
  markerMaterial: THREE.MeshStandardMaterial;
  glowMaterial: THREE.MeshBasicMaterial;
};

type DeviceKind = "router" | "server";

const GLOBE_RADIUS = 1.45;
const NETWORK_HUBS: NetworkHub[] = [
  { id: "colombo", city: "Colombo", country: "Sri Lanka", latitude: 6.9271, longitude: 79.8612 },
  { id: "singapore", city: "Singapore", country: "Singapore", latitude: 1.3521, longitude: 103.8198 },
  { id: "tokyo", city: "Tokyo", country: "Japan", latitude: 35.6762, longitude: 139.6503 },
  { id: "mumbai", city: "Mumbai", country: "India", latitude: 19.076, longitude: 72.8777 },
  { id: "dubai", city: "Dubai", country: "United Arab Emirates", latitude: 25.2048, longitude: 55.2708 },
  { id: "london", city: "London", country: "United Kingdom", latitude: 51.5072, longitude: -0.1276 },
  { id: "frankfurt", city: "Frankfurt", country: "Germany", latitude: 50.1109, longitude: 8.6821 },
  { id: "new-york", city: "New York", country: "United States", latitude: 40.7128, longitude: -74.006 },
  { id: "san-francisco", city: "San Francisco", country: "United States", latitude: 37.7749, longitude: -122.4194 },
  { id: "sydney", city: "Sydney", country: "Australia", latitude: -33.8688, longitude: 151.2093 },
];

const NETWORK_CONNECTIONS: ReadonlyArray<readonly [string, string]> = [
  ["colombo", "singapore"], ["colombo", "mumbai"], ["colombo", "dubai"],
  ["singapore", "tokyo"], ["singapore", "sydney"], ["singapore", "frankfurt"],
  ["mumbai", "dubai"], ["dubai", "frankfurt"], ["dubai", "london"],
  ["london", "frankfurt"], ["london", "new-york"], ["frankfurt", "new-york"],
  ["new-york", "san-francisco"], ["san-francisco", "tokyo"], ["tokyo", "sydney"],
];

function buildGreatCircle(
  start: THREE.Vector3,
  end: THREE.Vector3,
  radius: number,
  arcHeight: number,
  steps: number,
) {
  const angle = start.angleTo(end);
  const sinAngle = Math.sin(angle);
  const points: THREE.Vector3[] = [];

  for (let step = 0; step <= steps; step += 1) {
    const t = step / steps;
    let point: THREE.Vector3;

    if (Math.abs(sinAngle) < 0.0001) {
      point = start.clone().lerp(end, t).normalize();
    } else {
      const startWeight = Math.sin((1 - t) * angle) / sinAngle;
      const endWeight = Math.sin(t * angle) / sinAngle;
      point = start.clone().multiplyScalar(startWeight)
        .add(end.clone().multiplyScalar(endWeight))
        .normalize();
    }

    point.multiplyScalar(radius + Math.sin(Math.PI * t) * arcHeight);
    points.push(point);
  }

  return points;
}

function addLine(
  parent: THREE.Group,
  points: THREE.Vector3[],
  material: THREE.LineBasicMaterial,
) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(geometry, material);
  parent.add(line);
  return line;
}

function geographicPosition(latitude: number, longitude: number, radius: number) {
  const latitudeRadians = THREE.MathUtils.degToRad(latitude);
  const longitudeRadians = THREE.MathUtils.degToRad(longitude);
  const horizontalRadius = Math.cos(latitudeRadians) * radius;

  // Matches SphereGeometry's equirectangular UV orientation (u = (lon + 180) / 360).
  return new THREE.Vector3(
    horizontalRadius * Math.cos(longitudeRadians),
    Math.sin(latitudeRadians) * radius,
    -horizontalRadius * Math.sin(longitudeRadians),
  );
}

function createDevice(kind: DeviceKind) {
  const device = new THREE.Group();
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: kind === "router" ? 0x183a3b : 0x102b2d,
    emissive: kind === "router" ? 0x18c6c0 : 0x28504f,
    emissiveIntensity: 0.28,
    metalness: 0.68,
    roughness: 0.34,
  });
  const faceMaterial = new THREE.MeshStandardMaterial({
    color: 0x242424,
    emissive: 0x102b2d,
    emissiveIntensity: 0.3,
    metalness: 0.5,
    roughness: 0.4,
  });
  const ledMaterial = new THREE.MeshBasicMaterial({ color: 0x20d8ce });
  const highlightLedMaterial = new THREE.MeshBasicMaterial({ color: 0x91f5e9 });

  if (kind === "router") {
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.16, 0.22), bodyMaterial);
    device.add(body);

    const face = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.025, 0.012), faceMaterial);
    face.position.set(0, -0.035, 0.116);
    device.add(face);

    for (let index = 0; index < 3; index += 1) {
      const led = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), index === 2 ? highlightLedMaterial : ledMaterial);
      led.position.set(-0.065 + index * 0.045, -0.035, 0.128);
      device.add(led);
    }

    for (const side of [-1, 1]) {
      const antenna = new THREE.Mesh(
        new THREE.CylinderGeometry(0.006, 0.008, 0.18, 6),
        faceMaterial,
      );
      antenna.position.set(side * 0.12, 0.15, -0.07);
      antenna.rotation.z = side * -0.13;
      device.add(antenna);
      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.013, 8, 8), highlightLedMaterial);
      tip.position.set(side * 0.132, 0.24, -0.07);
      device.add(tip);
    }
  } else {
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.4, 0.22), bodyMaterial);
    device.add(body);

    const face = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.34, 0.014), faceMaterial);
    face.position.set(0, 0, 0.116);
    device.add(face);

    for (let index = 0; index < 3; index += 1) {
      const slot = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.065, 0.008), bodyMaterial);
      slot.position.set(0, 0.095 - index * 0.09, 0.127);
      device.add(slot);
      const led = new THREE.Mesh(new THREE.SphereGeometry(0.009, 8, 8), index === 1 ? highlightLedMaterial : ledMaterial);
      led.position.set(0.07, 0.095 - index * 0.09, 0.134);
      device.add(led);
    }
  }

  return device;
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

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.085, 0.105), bodyMaterial);
  satellite.add(body);

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
  const panelGrid = new THREE.LineSegments(panelGridGeometry, panelGridMaterial);
  for (const side of [-1, 1]) {
    const panel = new THREE.Mesh(panelGeometry, panelMaterial);
    panel.position.x = side * 0.16;
    satellite.add(panel);

    const grid = panelGrid.clone();
    grid.position.x = side * 0.16;
    satellite.add(grid);

    const support = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.009, 0.018), silverMaterial);
    support.position.x = side * 0.105;
    satellite.add(support);
  }

  const antenna = new THREE.Mesh(
    new THREE.CylinderGeometry(0.003, 0.004, 0.065, 6),
    silverMaterial,
  );
  antenna.position.set(0.035, 0.068, 0);
  satellite.add(antenna);

  const indicator = new THREE.Mesh(new THREE.SphereGeometry(0.009, 8, 8), indicatorMaterial);
  indicator.position.set(0.035, 0.104, 0);
  satellite.add(indicator);

  return satellite;
}

function getMaterials(root: THREE.Object3D) {
  const materials = new Set<THREE.Material>();
  root.traverse((object) => {
    if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
      const objectMaterials = Array.isArray(object.material) ? object.material : [object.material];
      objectMaterials.forEach((material) => materials.add(material));
    }
  });
  return [...materials];
}

function getGeometries(root: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>();
  root.traverse((object) => {
    if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
      geometries.add(object.geometry);
    }
  });
  return [...geometries];
}

export default function InteractiveNetworkGlobe() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modeRef = useRef(false);
  const hoverRef = useRef(false);
  const pointerRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef<{ pointerId: number; startX: number; startY: number; lastX: number; lastY: number; moved: boolean } | null>(null);
  const dragRotationRef = useRef({ x: 0, y: 0 });
  const pickHubRef = useRef<((clientX: number, clientY: number) => NetworkHub | null) | null>(null);
  const zoomRef = useRef<((deltaY: number) => void) | null>(null);
  const requestRenderRef = useRef<(() => void) | null>(null);
  const [topologyMode, setTopologyMode] = useState(false);
  const [selectedHub, setSelectedHub] = useState<NetworkHub | null>(null);
  const selectedHubIdRef = useRef<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  const requestRender = useCallback(() => requestRenderRef.current?.(), []);

  const toggleMode = useCallback(() => {
    modeRef.current = !modeRef.current;
    setTopologyMode(modeRef.current);
    requestRender();
  }, [requestRender]);

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
    sceneRoot.add(globeGroup);
    globeGroup.rotation.y = Math.PI;
    const dragRotation = dragRotationRef.current;

    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x102b2d,
      emissiveIntensity: 0.2,
      metalness: 0.28,
      roughness: 0.68,
      transparent: true,
      opacity: 1,
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
        // Keep the atmospheric deep ocean surface as a graceful fallback if the local texture cannot load.
      },
    );

    const shellMaterial = new THREE.MeshBasicMaterial({
      color: 0x20d8ce,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
    });
    globeGroup.add(new THREE.Mesh(
      new THREE.SphereGeometry(GLOBE_RADIUS + 0.08, 48, 36),
      shellMaterial,
    ));

    const gridMaterial = new THREE.LineBasicMaterial({
      color: 0x24615c,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
    });
    const gridRadius = GLOBE_RADIUS + 0.012;

    for (let latitude = -60; latitude <= 60; latitude += 30) {
      const points: THREE.Vector3[] = [];
      const phi = THREE.MathUtils.degToRad(latitude);
      for (let index = 0; index <= 96; index += 1) {
        const theta = (index / 96) * Math.PI * 2;
        points.push(new THREE.Vector3(
          gridRadius * Math.cos(phi) * Math.cos(theta),
          gridRadius * Math.sin(phi),
          gridRadius * Math.cos(phi) * Math.sin(theta),
        ));
      }
      addLine(globeGroup, points, gridMaterial);
    }

    for (let longitude = 0; longitude < 12; longitude += 1) {
      const points: THREE.Vector3[] = [];
      const theta = (longitude / 12) * Math.PI * 2;
      for (let index = 0; index <= 64; index += 1) {
        const phi = -Math.PI / 2 + (index / 64) * Math.PI;
        points.push(new THREE.Vector3(
          gridRadius * Math.cos(phi) * Math.cos(theta),
          gridRadius * Math.sin(phi),
          gridRadius * Math.cos(phi) * Math.sin(theta),
        ));
      }
      addLine(globeGroup, points, gridMaterial);
    }

    const hubById = new Map(NETWORK_HUBS.map((hub) => [hub.id, hub]));
    const hubDegrees = new Map<string, number>();
    NETWORK_CONNECTIONS.forEach(([from, to]) => {
      hubDegrees.set(from, (hubDegrees.get(from) ?? 0) + 1);
      hubDegrees.set(to, (hubDegrees.get(to) ?? 0) + 1);
    });
    const hubGeometry = new THREE.SphereGeometry(0.045, 16, 12);
    const hubGlowGeometry = new THREE.SphereGeometry(0.115, 16, 12);
    const hubMarkers: CityMarker[] = NETWORK_HUBS.map((hub, index) => {
      const position = geographicPosition(hub.latitude, hub.longitude, GLOBE_RADIUS + 0.045);
      const markerMaterial = new THREE.MeshStandardMaterial({
        color: index % 3 === 0 ? 0x91f5e9 : 0x20d8ce,
        emissive: index % 3 === 0 ? 0x18c6c0 : 0x18c6c0,
        emissiveIntensity: 1.9,
        metalness: 0.1,
        roughness: 0.2,
      });
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x91f5e9,
        transparent: true,
        opacity: 0.16,
        depthWrite: false,
      });
      const glow = new THREE.Mesh(hubGlowGeometry, glowMaterial);
      glow.position.copy(position);
      const marker = new THREE.Mesh(hubGeometry, markerMaterial);
      marker.position.copy(position);
      marker.userData.hubId = hub.id;
      globeGroup.add(glow, marker);
      return { hub, marker, glow, markerMaterial, glowMaterial };
    });

    const networkPacketGeometry = new THREE.SphereGeometry(0.026, 10, 8);
    const globalRoutes: GlobalRoute[] = NETWORK_CONNECTIONS.flatMap(([from, to], index) => {
      const fromHub = hubById.get(from);
      const toHub = hubById.get(to);
      if (!fromHub || !toHub) return [];

      const start = geographicPosition(fromHub.latitude, fromHub.longitude, 1).normalize();
      const end = geographicPosition(toHub.latitude, toHub.longitude, 1).normalize();
      const angle = start.angleTo(end);
      const points = buildGreatCircle(start, end, GLOBE_RADIUS + 0.025, 0.035 + angle * 0.11, 40);
      const material = new THREE.LineBasicMaterial({
        color: 0x18c6c0,
        transparent: true,
        opacity: index % 4 === 0 ? 0.53 : 0.43,
        depthWrite: false,
      });
      addLine(globeGroup, points, material);
      const packetMaterial = new THREE.MeshBasicMaterial({
        color: index % 4 === 0 ? 0x18c6c0 : 0xb2fff4,
        toneMapped: false,
      });
      const packetMesh = new THREE.Mesh(networkPacketGeometry, packetMaterial);
      globeGroup.add(packetMesh);
      return [{
        from,
        to,
        material,
        baseColor: 0x18c6c0,
        baseOpacity: index % 4 === 0 ? 0.53 : 0.43,
        packet: { points, speed: 0.18 + (index % 4) * 0.025, offset: index / NETWORK_CONNECTIONS.length, mesh: packetMesh },
      }];
    });
    const globePackets = globalRoutes.map((route) => route.packet);

    const routerSatellite = createDevice("router");
    routerSatellite.position.set(1.64, 0.94, 0.25);
    routerSatellite.rotation.set(0.25, -0.45, -0.25);
    routerSatellite.scale.setScalar(0.74);
    globeGroup.add(routerSatellite);

    const serverSatellite = createDevice("server");
    serverSatellite.position.set(-1.78, -0.82, 0.2);
    serverSatellite.rotation.set(0.2, 0.55, 0.25);
    serverSatellite.scale.setScalar(0.68);
    globeGroup.add(serverSatellite);

    const orbitMaterial = new THREE.MeshBasicMaterial({
      color: 0x24615c,
      transparent: true,
      opacity: 0.19,
      depthWrite: false,
    });
    const orbit = new THREE.Mesh(new THREE.TorusGeometry(1.9, 0.0035, 6, 160), orbitMaterial);
    orbit.rotation.set(0.95, 0.18, -0.3);
    globeGroup.add(orbit);

    const satelliteOrbit = new THREE.Group();
    satelliteOrbit.rotation.copy(orbit.rotation);
    globeGroup.add(satelliteOrbit);
    const satelliteOrbitRadiusX = 1.92;
    const satelliteOrbitRadiusY = 1.78;
    const satellitePathPoints = Array.from({ length: 129 }, (_, index) => {
      const angle = (index / 128) * Math.PI * 2;
      return new THREE.Vector3(
        satelliteOrbitRadiusX * Math.cos(angle),
        satelliteOrbitRadiusY * Math.sin(angle),
        0,
      );
    });
    addLine(
      satelliteOrbit,
      satellitePathPoints,
      new THREE.LineBasicMaterial({
        color: 0x24615c,
        transparent: true,
        opacity: 0.2,
        depthWrite: false,
      }),
    );

    const satellite = createSatellite();
    const satelliteTangent = new THREE.Vector3();
    const satelliteRight = new THREE.Vector3();
    const satelliteUp = new THREE.Vector3();
    const satelliteOrbitNormal = new THREE.Vector3(0, 0, 1);
    const satelliteOrientation = new THREE.Matrix4();
    satelliteOrbit.add(satellite);

    const orientSatellite = (angle: number) => {
      const cosine = Math.cos(angle);
      const sine = Math.sin(angle);
      satellite.position.set(
        satelliteOrbitRadiusX * cosine,
        satelliteOrbitRadiusY * sine,
        0,
      );
      satelliteTangent.set(
        -satelliteOrbitRadiusX * sine,
        satelliteOrbitRadiusY * cosine,
        0,
      ).normalize();
      satelliteRight.crossVectors(satelliteOrbitNormal, satelliteTangent).normalize();
      satelliteUp.crossVectors(satelliteTangent, satelliteRight).normalize();
      satelliteOrientation.makeBasis(satelliteRight, satelliteUp, satelliteTangent);
      satellite.quaternion.setFromRotationMatrix(satelliteOrientation);
    };
    orientSatellite(0);

    const orbitAccent = new THREE.Mesh(
      new THREE.TorusGeometry(1.82, 0.0025, 6, 160),
      new THREE.MeshBasicMaterial({ color: 0x24615c, transparent: true, opacity: 0.11, depthWrite: false }),
    );
    orbitAccent.rotation.set(-0.4, 0.72, 0.28);
    globeGroup.add(orbitAccent);

    const topologyGroup = new THREE.Group();
    topologyGroup.visible = false;
    sceneRoot.add(topologyGroup);

    const topologyPositions = [
      new THREE.Vector3(0, 0.22, 0.12),
      new THREE.Vector3(-1.2, 0.82, 0.08),
      new THREE.Vector3(1.2, 0.82, 0.08),
      new THREE.Vector3(-1.28, -0.65, 0.1),
      new THREE.Vector3(1.28, -0.65, 0.1),
      new THREE.Vector3(0, -0.96, 0.14),
    ];
    const topologyKinds: DeviceKind[] = ["router", "router", "router", "server", "server", "server"];
    const topologyDevices = topologyPositions.map((position, index) => {
      const device = createDevice(topologyKinds[index]);
      device.position.copy(position);
      device.scale.setScalar(index === 0 ? 1.08 : 0.9);
      if (index === 0) device.rotation.y = Math.PI * 0.12;
      topologyGroup.add(device);
      return device;
    });

    const topologyLineMaterial = new THREE.LineBasicMaterial({
      color: 0x18c6c0,
      transparent: true,
      opacity: 0.76,
      depthWrite: false,
    });
    const topologyAccentMaterial = new THREE.LineBasicMaterial({
      color: 0x20d8ce,
      transparent: true,
      opacity: 0.78,
      depthWrite: false,
    });
    const topologyEdges = [
      [0, 1], [0, 2], [0, 5], [1, 3], [2, 4], [5, 3], [5, 4], [1, 2],
    ];
    const topologyPaths = topologyEdges.map(([startIndex, endIndex], index) => {
      const start = topologyPositions[startIndex].clone();
      const end = topologyPositions[endIndex].clone();
      const middle = start.clone().add(end).multiplyScalar(0.5);
      middle.z += index % 2 === 0 ? 0.08 : -0.06;
      const curve = new THREE.QuadraticBezierCurve3(start, middle, end);
      const points = curve.getPoints(32);
      addLine(topologyGroup, points, index % 3 === 0 ? topologyAccentMaterial : topologyLineMaterial);
      return points;
    });

    const topologyPacketGeometry = new THREE.SphereGeometry(0.033, 10, 8);
    const topologyPacketMaterials = [
      new THREE.MeshBasicMaterial({ color: 0xb2fff4, toneMapped: false }),
      new THREE.MeshBasicMaterial({ color: 0x18c6c0, toneMapped: false }),
      new THREE.MeshBasicMaterial({ color: 0x20d8ce, toneMapped: false }),
    ];
    const topologyPackets: PacketPath[] = topologyPaths.slice(0, 5).map((points, index) => {
      const mesh = new THREE.Mesh(topologyPacketGeometry, topologyPacketMaterials[index % topologyPacketMaterials.length]);
      topologyGroup.add(mesh);
      return { points, speed: 0.32 + (index % 3) * 0.08, offset: index / 5, mesh };
    });

    const globeFades: FadedMaterial[] = getMaterials(globeGroup).map((material) => {
      material.transparent = true;
      return { material, baseOpacity: material.opacity };
    });
    const topologyFades: FadedMaterial[] = getMaterials(topologyGroup).map((material) => {
      const baseOpacity = material.opacity;
      material.transparent = true;
      material.depthWrite = false;
      material.opacity = 0;
      return { material, baseOpacity };
    });

    const allMaterials = new Set([...getMaterials(globeGroup), ...getMaterials(topologyGroup)]);
    const allGeometries = new Set([...getGeometries(globeGroup), ...getGeometries(topologyGroup)]);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const raycaster = new THREE.Raycaster();
    const rayPointer = new THREE.Vector2();
    pickHubRef.current = (clientX, clientY) => {
      const bounds = stage.getBoundingClientRect();
      rayPointer.set(
        ((clientX - bounds.left) / bounds.width) * 2 - 1,
        -(((clientY - bounds.top) / bounds.height) * 2 - 1),
      );
      scene.updateMatrixWorld(true);
      camera.updateMatrixWorld();
      raycaster.setFromCamera(rayPointer, camera);
      const selectableObjects = [globeSurface, ...hubMarkers.map(({ marker }) => marker)];
      const hit = raycaster.intersectObjects(selectableObjects, false)[0]?.object;
      const hubId = hit?.userData.hubId as string | undefined;
      return hubId ? hubById.get(hubId) ?? null : null;
    };
    zoomRef.current = (deltaY) => {
      camera.position.z = THREE.MathUtils.clamp(camera.position.z + deltaY * 0.003, 4.9, 8.4);
      requestRenderRef.current?.();
    };
    let reduceMotion = reducedMotion.matches;
    let visible = false;
    let frameId = 0;
    let previousTime = 0;
    let elapsed = 0;
    let topologyProgress = 0;

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

      if (!reduceMotion) orientSatellite(elapsed * 0.24);

      const target = modeRef.current ? 1 : 0;
      if (reduceMotion) {
        topologyProgress = target;
      } else {
        const blend = 1 - Math.exp(-5.2 * delta);
        topologyProgress += (target - topologyProgress) * blend;
        if (Math.abs(target - topologyProgress) < 0.001) topologyProgress = target;
      }

      globeGroup.scale.setScalar(1 - topologyProgress * 0.17);
      sphereMaterial.opacity = 1 - topologyProgress * 0.48;
      sphereMaterial.emissiveIntensity = 0.2 + (hoverRef.current ? 0.12 : 0) - topologyProgress * 0.08;
      globeGroup.rotation.y += delta * (reduceMotion ? 0 : hoverRef.current ? 0.28 : 0.075);
      globeGroup.rotation.x += ((pointerRef.current.y * 0.1) - globeGroup.rotation.x) * (reduceMotion ? 1 : 0.055);
      globeGroup.rotation.z += ((pointerRef.current.x * -0.07) - globeGroup.rotation.z) * (reduceMotion ? 1 : 0.055);

      const targetRootX = pointerRef.current.y * 0.055 + dragRotation.x;
      const targetRootY = pointerRef.current.x * 0.09 + dragRotation.y;
      sceneRoot.rotation.x += (targetRootX - sceneRoot.rotation.x) * (reduceMotion ? 1 : 0.055);
      sceneRoot.rotation.y += (targetRootY - sceneRoot.rotation.y) * (reduceMotion ? 1 : 0.055);

      globeFades.forEach(({ material, baseOpacity }) => {
        if (material !== sphereMaterial) material.opacity = baseOpacity * (1 - topologyProgress * 0.38);
      });

      const selectedId = selectedHubIdRef.current;
      const connectedHubIds = new Set<string>();
      if (selectedId) {
        globalRoutes.forEach(({ from, to }) => {
          if (from === selectedId) connectedHubIds.add(to);
          if (to === selectedId) connectedHubIds.add(from);
        });
      }
      hubMarkers.forEach(({ hub, marker, glow, markerMaterial, glowMaterial }) => {
        const isSelected = hub.id === selectedId;
        const isConnected = connectedHubIds.has(hub.id);
        const isMajorHub = (hubDegrees.get(hub.id) ?? 0) >= 3;
        const pulse = isMajorHub && !reduceMotion ? 1 + Math.sin(elapsed * 2.2 + NETWORK_HUBS.indexOf(hub) * 0.7) * 0.08 : 1;
        marker.scale.setScalar((isSelected ? 1.5 : 1) * pulse);
        markerMaterial.emissiveIntensity = isSelected ? 3.5 : isConnected ? 2.7 : hoverRef.current ? 2.35 : 1.9;
        glow.scale.setScalar((isSelected ? 1.75 : isConnected ? 1.35 : 1) * pulse);
        glowMaterial.opacity = isSelected ? 0.44 : isConnected ? 0.3 : hoverRef.current ? 0.23 : 0.14;
      });
      globalRoutes.forEach(({ from, to, material, baseColor, baseOpacity }) => {
        const routeHighlighted = !selectedId || from === selectedId || to === selectedId;
        material.color.setHex(selectedId && routeHighlighted ? 0x91f5e9 : baseColor);
        material.opacity = selectedId ? routeHighlighted ? 0.88 : 0.075 : baseOpacity;
      });

      topologyFades.forEach(({ material, baseOpacity }) => {
        material.opacity = baseOpacity * topologyProgress;
      });
      topologyGroup.visible = topologyProgress > 0.005;
      topologyGroup.position.z = topologyProgress * 1.75;
      topologyGroup.scale.setScalar(0.8 + topologyProgress * 0.2);

      const updatePackets = (packets: PacketPath[]) => {
        packets.forEach(({ points, speed, offset, mesh }) => {
          const progress = ((elapsed * speed + offset) % 1) * (points.length - 1);
          const startIndex = Math.floor(progress);
          const fraction = progress - startIndex;
          mesh.position.copy(points[startIndex]).lerp(points[Math.min(startIndex + 1, points.length - 1)], fraction);
          mesh.visible = reduceMotion ? false : true;
        });
      };
      updatePackets(globePackets);
      globalRoutes.forEach(({ from, to, packet }) => {
        packet.mesh.visible = !reduceMotion && (!selectedId || from === selectedId || to === selectedId);
      });
      updatePackets(topologyPackets);

      renderer.render(scene, camera);

      if (!reduceMotion || Math.abs(target - topologyProgress) > 0.001) {
        frameId = window.requestAnimationFrame(renderFrame);
      }
    };

    requestRenderRef.current = () => {
      if (visible && frameId === 0) frameId = window.requestAnimationFrame(renderFrame);
    };

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) {
        previousTime = 0;
        requestRenderRef.current?.();
      } else if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
      }
    }, { threshold: 0.01 });
    intersectionObserver.observe(stage);

    const resizeObserver = typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(resize)
      : null;
    resizeObserver?.observe(stage);
    window.addEventListener("resize", resize);
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      zoomRef.current?.(event.deltaY);
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
      resizeObserver?.disconnect();
      window.removeEventListener("resize", resize);
      stage.removeEventListener("wheel", handleWheel);
      reducedMotion.removeEventListener("change", handleReducedMotion);
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      requestRenderRef.current = null;
      pickHubRef.current = null;
      zoomRef.current = null;

      allGeometries.forEach((geometry) => geometry.dispose());
      allMaterials.forEach((material) => material.dispose());
      mapTexture?.dispose();
      renderer.dispose();
    };
  }, []);

  const updateSelectedHub = (hub: NetworkHub | null) => {
    selectedHubIdRef.current = hub?.id ?? null;
    setSelectedHub(hub);
    requestRender();
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || (event.target as HTMLElement).closest("button, [data-globe-ui]")) return;
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
    if (event.pointerType === "touch") {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;

      const totalX = event.clientX - drag.startX;
      const totalY = event.clientY - drag.startY;
      const deltaX = event.clientX - drag.lastX;
      const deltaY = event.clientY - drag.lastY;
      drag.moved ||= Math.hypot(totalX, totalY) > 6;

      if (Math.abs(totalX) > Math.abs(totalY) && drag.moved) {
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.setPointerCapture(event.pointerId);
        }
        dragRotationRef.current.y += deltaX * 0.006;
        dragRotationRef.current.x = THREE.MathUtils.clamp(dragRotationRef.current.x + deltaY * 0.006, -1.15, 1.15);
        requestRender();
      }

      drag.lastX = event.clientX;
      drag.lastY = event.clientY;
      return;
    }
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerRef.current = {
      x: ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      y: -(((event.clientY - bounds.top) / bounds.height) * 2 - 1),
    };
    const drag = dragRef.current;
    if (drag?.pointerId === event.pointerId) {
      const deltaX = event.clientX - drag.lastX;
      const deltaY = event.clientY - drag.lastY;
      drag.moved ||= Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 4;
      if (drag.moved) {
        dragRotationRef.current.y += deltaX * 0.006;
        dragRotationRef.current.x = THREE.MathUtils.clamp(dragRotationRef.current.x + deltaY * 0.006, -1.15, 1.15);
        requestRender();
      }
      drag.lastX = event.clientX;
      drag.lastY = event.clientY;
    }
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (!drag.moved && !(event.target as HTMLElement).closest("button, [data-globe-ui]")) {
      updateSelectedHub(pickHubRef.current?.(event.clientX, event.clientY) ?? null);
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
  };

  const handlePointerCancel = () => {
    dragRef.current = null;
  };

  const handlePointerLeave = () => {
    hoverRef.current = false;
    pointerRef.current = { x: 0, y: 0 };
    requestRender();
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      updateSelectedHub(null);
      return;
    }
    const rotation = dragRotationRef.current;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      rotation.y += event.key === "ArrowLeft" ? -0.12 : 0.12;
      event.preventDefault();
      requestRender();
    } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      rotation.x = THREE.MathUtils.clamp(rotation.x + (event.key === "ArrowUp" ? 0.12 : -0.12), -1.15, 1.15);
      event.preventDefault();
      requestRender();
    }
  };

  return (
    <div
      aria-label="Interactive global network globe. Drag to rotate, scroll to zoom, select a city hub."
      className={unavailable ? "network-visualization network-unavailable" : "network-visualization"}
      onKeyDown={handleKeyDown}
      onPointerCancel={handlePointerCancel}
      onPointerDown={handlePointerDown}
      onPointerEnter={() => { hoverRef.current = true; requestRender(); }}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      ref={stageRef}
      role="group"
      style={{ touchAction: "pan-y" }}
      tabIndex={0}
    >
      <canvas aria-hidden="true" className="network-canvas" ref={canvasRef} />

      {unavailable ? (
        <span className="network-fallback">
          <span className="network-fallback-mark" aria-hidden="true">◎</span>
          <span>3D NETWORK VIEW UNAVAILABLE</span>
          <span className="network-fallback-detail">WebGL is not available in this browser.</span>
        </span>
      ) : (
        <>
          <span className="network-hud network-hud-top" data-globe-ui>
            <span className="network-live-dot" />
            {topologyMode ? "ROUTING TOPOLOGY" : "GLOBAL INTERNET"}
          </span>
          <button
            aria-pressed={topologyMode}
            className="network-mode-control"
            data-globe-ui
            onClick={(event) => { event.stopPropagation(); toggleMode(); }}
            onPointerDown={(event) => event.stopPropagation()}
            type="button"
          >
            {topologyMode ? "RETURN TO GLOBE" : "TOPOLOGY VIEW"}
          </button>
          <span className="network-hud network-hud-side" data-globe-ui>SYS / NET 01</span>
          <span className="network-hud network-hud-bottom" data-globe-ui>
            <span><i className="network-legend-node" /> {NETWORK_HUBS.length} GLOBAL HUBS</span>
            <span><i className="network-legend-server" /> {NETWORK_CONNECTIONS.length} ROUTES</span>
          </span>
          {selectedHub && !topologyMode && (
            <aside aria-live="polite" className="network-hub-panel" data-globe-ui>
              <button
                aria-label="Clear selected network hub"
                className="network-hub-clear"
                onClick={() => updateSelectedHub(null)}
                onPointerDown={(event) => event.stopPropagation()}
                type="button"
              >×</button>
              <span className="network-hub-panel-label">SELECTED NETWORK HUB</span>
              <strong>{selectedHub.city}</strong>
              <span className="network-hub-country">{selectedHub.country}</span>
              <span className="network-hub-connections">
                {NETWORK_CONNECTIONS.filter(([from, to]) => from === selectedHub.id || to === selectedHub.id).length} CONNECTED HUBS
              </span>
            </aside>
          )}
          <span className="network-interaction-hint" data-globe-ui>
            DRAG TO ROTATE · SCROLL TO ZOOM · SELECT A HUB
          </span>
        </>
      )}
    </div>
  );
}
