import { Suspense } from "react";
import { useLayoutEffect, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls, Html, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { ModelObject } from "./ModelObject";
import type { Finish, Model } from "../types";
import { RENDER_WALL_IMAGE, asset } from "../config";

/** Own lighting studio, no external HDR download needed. */
function Studio({ metal = false }: { metal?: boolean }) {
  return (
    <Environment resolution={512}>
      {/* Metal only reflects its surroundings: give it a mid-gray room plus bright strips so it does not look black. */}
      {metal && (
        <mesh scale={60}>
          <sphereGeometry args={[1, 32, 16]} />
          <meshBasicMaterial color="#7d7d84" side={THREE.BackSide} />
        </mesh>
      )}
      {metal && <Lightformer form="rect" intensity={4} position={[3, 1, 4]} rotation-y={-2.4} scale={[1.2, 8, 1]} />}
      {metal && <Lightformer form="rect" intensity={4} position={[-3, 1, 4]} rotation-y={2.4} scale={[1.2, 8, 1]} />}
      <Lightformer form="rect" intensity={3} position={[0, 5, 2]} scale={[10, 4, 1]} />
      <Lightformer form="rect" intensity={2} position={[-5, 2, 1]} rotation-y={Math.PI / 2} scale={[8, 4, 1]} />
      <Lightformer form="rect" intensity={1.5} position={[5, 1, -1]} rotation-y={-Math.PI / 2} scale={[8, 4, 1]} />
      <Lightformer form="ring" intensity={1} color="#fff" position={[0, 2, -6]} scale={6} />
    </Environment>
  );
}

function Loading() {
  return <Html center><span className="loading">Loading…</span></Html>;
}

const glProps = { toneMapping: THREE.NeutralToneMapping, antialias: true } as const;

/** Left: interactive model, free rotate/zoom. */
export function InteractiveViewer({ model, color, finish }: { model: Model; color: string; finish?: Finish }) {
  return (
    <Canvas camera={{ position: [3, 2.2, 3.5], fov: 40 }} gl={glProps} dpr={[1, 2]}>
      <Suspense fallback={<Loading />}>
        <Studio metal={finish === "metal"} />
        <ModelObject model={model} color={color} finish={finish} />
        <ContactShadows position={[0, 0, 0]} opacity={0.35} scale={8} blur={2.5} far={3} />
      </Suspense>
      <OrbitControls makeDefault target={[0, 0.9, 0]} enablePan={false} minDistance={2.5} maxDistance={9} />
    </Canvas>
  );
}

/** Right: fixed "product photo" render with studio lighting and soft shadow. */
export function RenderPreview({ model, color, finish }: { model: Model; color: string; finish?: Finish }) {
  return (
    <Canvas shadows camera={{ position: [4.2, 2.2, 5.4], fov: 30 }} gl={glProps} dpr={[1, 2]}>
      <color attach="background" args={["#e6e2da"]} />
      <Suspense fallback={<Loading />}>
        <Studio metal={finish === "metal"} />
        <directionalLight
          position={[4, 6, 3]}
          intensity={1.4}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0004}
          shadow-camera-left={-3}
          shadow-camera-right={3}
          shadow-camera-top={3}
          shadow-camera-bottom={-3}
        />
        <group rotation-y={-0.5}>
          <ModelObject model={model} color={color} finish={finish} />
        </group>
        <ContactShadows position={[0, 0.001, 0]} opacity={0.5} scale={8} blur={2.2} far={2.5} />
        <Table />
        {RENDER_WALL_IMAGE ? <WallPhoto url={RENDER_WALL_IMAGE} /> : <Wall />}
      </Suspense>
      <LookAt target={[0, 1, 0]} />
    </Canvas>
  );
}

/** Aim the fixed camera at the middle of the model (model is 2 tall, bottom at y=0). */
function LookAt({ target }: { target: [number, number, number] }) {
  const camera = useThree((s) => s.camera);
  useLayoutEffect(() => {
    camera.lookAt(...target);
  }, [camera, target]);
  return null;
}

function makeCanvasTexture(size: [number, number], draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) {
  const c = document.createElement("canvas");
  [c.width, c.height] = size;
  draw(c.getContext("2d")!, c.width, c.height);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** Wooden tabletop with procedural grain. */
function Table() {
  const map = useMemo(() => {
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const t = makeCanvasTexture([1024, 1024], (ctx, w, h) => {
      ctx.fillStyle = "#b58b60";
      ctx.fillRect(0, 0, w, h);
      // planks
      const planks = 5;
      for (let p = 0; p < planks; p++) {
        const y0 = (p * h) / planks;
        ctx.fillStyle = `hsl(${28 + rnd() * 6}, ${32 + rnd() * 8}%, ${52 + rnd() * 8}%)`;
        ctx.fillRect(0, y0, w, h / planks);
        for (let i = 0; i < 90; i++) {
          const y = y0 + rnd() * (h / planks);
          ctx.strokeStyle = `rgba(80,50,25,${0.05 + rnd() * 0.12})`;
          ctx.lineWidth = 0.6 + rnd() * 1.6;
          ctx.beginPath();
          ctx.moveTo(0, y);
          for (let x = 0; x <= w; x += 64) ctx.lineTo(x, y + Math.sin(x * 0.01 + i) * 2.5 * rnd());
          ctx.stroke();
        }
        ctx.fillStyle = "rgba(50,30,15,0.35)";
        ctx.fillRect(0, y0, w, 2);
      }
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2, 2);
    return t;
  }, []);
  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[16, 16]} />
      <meshStandardMaterial map={map} roughness={0.55} envMapIntensity={0.5} />
    </mesh>
  );
}

const WALL_POS: [number, number, number] = [0, 5, -3.5];
const WALL_SIZE: [number, number] = [30, 14];

/** Calm wall with soft window light, modern/minimalist. */
function Wall() {
  const map = useMemo(
    () =>
      makeCanvasTexture([512, 512], (ctx, w, h) => {
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, "#efece6");
        g.addColorStop(1, "#d9d4ca");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
        const r = ctx.createRadialGradient(w * 0.78, h * 0.3, 10, w * 0.78, h * 0.3, w * 0.7);
        r.addColorStop(0, "rgba(255,250,240,0.85)");
        r.addColorStop(1, "rgba(255,250,240,0)");
        ctx.fillStyle = r;
        ctx.fillRect(0, 0, w, h);
      }),
    [],
  );
  return (
    <mesh position={WALL_POS}>
      <planeGeometry args={WALL_SIZE} />
      <meshBasicMaterial map={map} />
    </mesh>
  );
}

/** Own background photo as wall (see RENDER_WALL_IMAGE in config.ts). */
function WallPhoto({ url }: { url: string }) {
  const map = useTexture(asset(url));
  map.colorSpace = THREE.SRGBColorSpace;
  return (
    <mesh position={WALL_POS}>
      <planeGeometry args={WALL_SIZE} />
      <meshBasicMaterial map={map} />
    </mesh>
  );
}
