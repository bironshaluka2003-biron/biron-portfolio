"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type Props = {
  onReady: () => void;
  onUnavailable: () => void;
};

const RADIUS = 1.45;
const DURATION = 5.7;

const hubs = [
  { name: "Colombo", lat: 6.9271, lon: 79.8612 },
  { name: "Singapore", lat: 1.3521, lon: 103.8198 },
  { name: "Tokyo", lat: 35.6762, lon: 139.6503 },
  { name: "Mumbai", lat: 19.076, lon: 72.8777 },
  { name: "Dubai", lat: 25.2048, lon: 55.2708 },
  { name: "London", lat: 51.5072, lon: -0.1276 },
  { name: "Frankfurt", lat: 50.1109, lon: 8.6821 },
  { name: "New York", lat: 40.7128, lon: -74.006 },
  { name: "San Francisco", lat: 37.7749, lon: -122.4194 },
  { name: "Sydney", lat: -33.8688, lon: 151.2093 },
] as const;

const routes = [
  [0, 1], [0, 3], [0, 4], [1, 2], [1, 9], [1, 8], [2, 6],
  [3, 6], [4, 5], [5, 6], [5, 7], [6, 2], [7, 8],
] as const;

type RouteLine = { curve: THREE.QuadraticBezierCurve3; geometry: THREE.BufferGeometry; material: THREE.LineBasicMaterial };

function smooth(value: number) {
  const t = THREE.MathUtils.clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
}

function pointOnGlobe(latitude: number, longitude: number, radius = RADIUS) {
  const lat = THREE.MathUtils.degToRad(latitude);
  const lon = THREE.MathUtils.degToRad(longitude);
  return new THREE.Vector3(
    radius * Math.cos(lat) * Math.cos(lon),
    radius * Math.sin(lat),
    -radius * Math.cos(lat) * Math.sin(lon),
  );
}

function buildArc(startIndex: number, endIndex: number) {
  const start = pointOnGlobe(hubs[startIndex].lat, hubs[startIndex].lon, RADIUS * 1.006);
  const end = pointOnGlobe(hubs[endIndex].lat, hubs[endIndex].lon, RADIUS * 1.006);
  const angle = start.angleTo(end);
  const control = start.clone().add(end).normalize().multiplyScalar(RADIUS * (1.04 + angle * 0.1));
  const curve = new THREE.QuadraticBezierCurve3(start, control, end);
  const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(56));
  geometry.setDrawRange(0, 1);
  const material = new THREE.LineBasicMaterial({
    color: 0x18c6c0,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  return { curve, geometry, material };
}

function disposeScene(scene: THREE.Scene, renderer: THREE.WebGLRenderer, texture: THREE.Texture | null) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  scene.traverse((object) => {
    if (!(object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.LineSegments)) return;
    geometries.add(object.geometry);
    const attached = Array.isArray(object.material) ? object.material : [object.material];
    attached.forEach((material) => materials.add(material));
  });
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
  texture?.dispose();
  renderer.dispose();
}

export function NetworkIntroScene({ onReady, onUnavailable }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const root = document.documentElement;
    if (
      root.dataset.portfolioIntroSeen === "true" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: window.innerWidth >= 700,
        powerPreference: "low-power",
        failIfMajorPerformanceCaveat: false,
      });
    } catch {
      onUnavailable();
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setClearColor(0x071416, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 80);
    const rootGroup = new THREE.Group();
    rootGroup.rotation.y = Math.PI;
    scene.add(rootGroup);

    const globeGroup = new THREE.Group();
    rootGroup.add(globeGroup);

    scene.add(new THREE.AmbientLight(0xa3b8b5, 0.95));
    const keyLight = new THREE.PointLight(0x18c6c0, 16, 14);
    keyLight.position.set(-3.2, 2.8, 4.5);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight(0x20d8ce, 8, 13);
    rimLight.position.set(3.4, -1.8, -2.5);
    scene.add(rimLight);

    const globeMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x102b2d,
      emissiveIntensity: 0.22,
      metalness: 0.28,
      roughness: 0.68,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(RADIUS, window.innerWidth < 600 ? 42 : 60, window.innerWidth < 600 ? 32 : 44),
      globeMaterial,
    );
    globeGroup.add(globe);

    let mapTexture: THREE.Texture | null = null;
    let disposed = false;
    mapTexture = new THREE.TextureLoader().load(
      "/world-map.svg",
      (texture) => {
        if (disposed) {
          texture.dispose();
          return;
        }
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 3);
        texture.generateMipmaps = true;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        globeMaterial.map = texture;
        globeMaterial.needsUpdate = true;
        onReady();
      },
      undefined,
      () => {
        console.error("[portfolio intro] The local /world-map.svg texture could not be loaded; showing a dark globe fallback.");
      },
    );

    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x20d8ce,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(RADIUS + 0.09, window.innerWidth < 600 ? 32 : 48, window.innerWidth < 600 ? 24 : 32),
      atmosphereMaterial,
    );
    globeGroup.add(atmosphere);

    const nodeGeometry = new THREE.SphereGeometry(0.026, 12, 10);
    const nodeMaterials = hubs.map(() => new THREE.MeshBasicMaterial({
      color: 0x91f5e9,
      toneMapped: false,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    }));
    const nodeMeshes = hubs.map((hub, index) => {
      const node = new THREE.Mesh(nodeGeometry, nodeMaterials[index]);
      node.position.copy(pointOnGlobe(hub.lat, hub.lon, RADIUS + 0.026));
      node.scale.setScalar(0.1);
      globeGroup.add(node);
      return node;
    });

    const routeLines: RouteLine[] = routes.map(([from, to]) => {
      const arc = buildArc(from, to);
      const line = new THREE.Line(arc.geometry, arc.material);
      line.renderOrder = 2;
      globeGroup.add(line);
      return arc;
    });

    const packetGeometry = new THREE.SphereGeometry(0.014, 8, 6);
    const packetMaterial = new THREE.MeshBasicMaterial({
      color: 0xb2fff4,
      toneMapped: false,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const packets = routeLines.slice(0, 8).map((route, index) => {
      const packet = new THREE.Mesh(packetGeometry, packetMaterial);
      packet.userData.routeIndex = index;
      packet.userData.offset = index / 8;
      globeGroup.add(packet);
      return packet;
    });

    const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(resize);
    let frameId = 0;
    let previousTime = 0;
    let elapsed = 0;
    function resize() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const aspect = width / Math.max(1, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, width < 600 ? 1.1 : width < 1100 ? 1.35 : 1.6));
      renderer.setSize(width, height, false);
      camera.aspect = aspect;
      camera.updateProjectionMatrix();

      const fitDistance = (RADIUS * 2) / (0.78 * 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * Math.min(aspect, 1));
      camera.userData.fitDistance = fitDistance;
      camera.position.z = fitDistance * 1.18;
    }

    const visibilityChange = () => {
      if (document.hidden) {
        if (frameId) window.cancelAnimationFrame(frameId);
        frameId = 0;
      } else if (!disposed && !frameId) {
        previousTime = 0;
        frameId = window.requestAnimationFrame(renderFrame);
      }
    };

    function renderFrame(time: number) {
      frameId = 0;
      if (disposed || document.hidden) return;
      const delta = previousTime === 0 ? 0 : Math.min((time - previousTime) / 1000, 0.04);
      previousTime = time;
      elapsed += delta;
      const progress = THREE.MathUtils.clamp(elapsed / DURATION, 0, 1);

      const reveal = smooth(progress / 0.2);
      const settle = smooth((progress - 0.72) / 0.2);
      globeGroup.scale.setScalar(0.72 + reveal * 0.28);
      globeGroup.rotation.y += delta * 0.075;
      globeGroup.rotation.x = Math.sin(elapsed * 0.22) * 0.018;

      const fitDistance = Number(camera.userData.fitDistance) || 6;
      const cameraIn = smooth(progress / 0.22);
      const cameraOut = smooth((progress - 0.56) / 0.38);
      const closeDistance = fitDistance * 0.97;
      camera.position.z = THREE.MathUtils.lerp(
        THREE.MathUtils.lerp(fitDistance * 1.2, closeDistance, cameraIn),
        fitDistance * 1.07,
        cameraOut,
      );

      globeMaterial.opacity = 0.16 + reveal * 0.84;
      if (globeMaterial.opacity > 0.98 && globeMaterial.depthWrite === false) {
        globeMaterial.depthWrite = true;
        globeMaterial.needsUpdate = true;
      }
      atmosphereMaterial.opacity = 0.025 + reveal * 0.115;
      keyLight.intensity = 5 + reveal * 11;
      rimLight.intensity = 2 + reveal * 6;

      const nodeStart = 0.19;
      nodeMeshes.forEach((node, index) => {
        const nodeProgress = smooth((progress - nodeStart - index * 0.035) / 0.12);
        const pulse = 1 + Math.sin(elapsed * 2.1 + index * 0.83) * 0.12;
        node.scale.setScalar(Math.max(0.001, (0.2 + nodeProgress * 0.8) * pulse));
        nodeMaterials[index].opacity = nodeProgress;
      });

      routeLines.forEach((route, index) => {
        const start = 0.29 + index * 0.022;
        const routeProgress = smooth((progress - start) / 0.2);
        route.geometry.setDrawRange(0, Math.max(1, Math.floor(57 * routeProgress)));
        route.material.opacity = routeProgress * 0.43;
      });

      const packetProgress = smooth((progress - 0.49) / 0.2);
      packetMaterial.opacity = packetProgress;
      packets.forEach((packet, index) => {
        const routeIndex = Number(packet.userData.routeIndex);
        const route = routeLines[routeIndex];
        const phase = (elapsed * 0.105 + Number(packet.userData.offset)) % 1;
        packet.position.copy(route.curve.getPointAt(phase));
        const pulse = 0.9 + Math.sin(elapsed * 3 + index) * 0.12;
        packet.scale.setScalar(pulse);
      });

      renderer.render(scene, camera);
      if (progress < 1) frameId = window.requestAnimationFrame(renderFrame);
    }

    function handleContextLost(event: Event) {
      event.preventDefault();
      if (frameId) window.cancelAnimationFrame(frameId);
      frameId = 0;
      onUnavailable();
    }

    resizeObserver?.observe(canvas.parentElement ?? canvas);
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", visibilityChange);
    canvas.addEventListener("webglcontextlost", handleContextLost);
    resize();
    renderer.render(scene, camera);
    frameId = window.requestAnimationFrame(renderFrame);

    return () => {
      disposed = true;
      if (frameId) window.cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", visibilityChange);
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      disposeScene(scene, renderer, mapTexture);
    };
  }, [onReady, onUnavailable]);

  return <canvas aria-hidden="true" className="intro-network-canvas" ref={canvasRef} />;
}
