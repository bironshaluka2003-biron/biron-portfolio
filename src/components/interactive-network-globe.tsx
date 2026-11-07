"use client";

import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import * as THREE from "three";

const GLOBE_RADIUS = 1.45;
const SATELLITE_ORBIT_X = 1.92;
const SATELLITE_ORBIT_Y = 1.78;

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
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef({ x: 0, y: 0, active: false });
  const dragRef = useRef<{ pointerId: number; startX: number; startY: number; lastX: number; lastY: number; moved: boolean } | null>(null);
  const rotationRef = useRef({ x: 0, y: 0 });
  const requestRenderRef = useRef<(() => void) | null>(null);
  const [unavailable, setUnavailable] = useState(false);

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
    let frameId = 0;
    let previousTime = 0;
    let elapsed = 0;

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

      globeGroup.rotation.y += delta * (reduceMotion ? 0 : pointerRef.current.active ? 0.28 : 0.075);
      const targetRootX = pointerRef.current.y * 0.055 + rotationRef.current.x;
      const targetRootY = pointerRef.current.x * 0.09 + rotationRef.current.y;
      sceneRoot.rotation.x += (targetRootX - sceneRoot.rotation.x) * (reduceMotion ? 1 : 0.055);
      sceneRoot.rotation.y += (targetRootY - sceneRoot.rotation.y) * (reduceMotion ? 1 : 0.055);

      renderer.render(scene, camera);
      if (!reduceMotion) frameId = window.requestAnimationFrame(renderFrame);
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

    const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    resizeObserver?.observe(stage);
    window.addEventListener("resize", resize);

    const handleWheel = (event: WheelEvent) => {
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
      resizeObserver?.disconnect();
      window.removeEventListener("resize", resize);
      stage.removeEventListener("wheel", handleWheel);
      reducedMotion.removeEventListener("change", handleReducedMotion);
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      requestRenderRef.current = null;
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      mapTexture?.dispose();
      renderer.dispose();
    };
  }, []);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
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
      active: true,
    };

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
    if (dragRef.current?.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    dragRef.current = null;
  };

  const handlePointerCancel = () => {
    dragRef.current = null;
  };

  const handlePointerLeave = () => {
    pointerRef.current = { x: 0, y: 0, active: false };
    requestRenderRef.current?.();
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

  return (
    <div
      aria-label="Interactive 3D Earth globe"
      className={unavailable ? "network-visualization network-unavailable" : "network-visualization"}
      onKeyDown={handleKeyDown}
      onPointerCancel={handlePointerCancel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      ref={stageRef}
      role="group"
      tabIndex={0}
    >
      <canvas aria-hidden="true" className="network-canvas" ref={canvasRef} />
    </div>
  );
}
