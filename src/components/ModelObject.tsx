import { useEffect, useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { ThreeMFLoader } from "three/examples/jsm/loaders/3MFLoader.js";
import * as THREE from "three";
import type { Finish, Model } from "../types";
import { asset } from "../config";

const TARGET_SIZE = 2;

/** Scale to a fixed size, center in x/z, put the bottom at y=0. */
function Fitted({ object }: { object: THREE.Object3D }) {
  const { scale, position } = useMemo(() => {
    object.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) o.castShadow = true;
    });
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const s = TARGET_SIZE / (Math.max(size.x, size.y, size.z) || 1);
    return {
      scale: s,
      position: new THREE.Vector3(-center.x * s, -box.min.y * s, -center.z * s),
    };
  }, [object]);
  return (
    <group position={position} scale={scale}>
      <primitive object={object} />
    </group>
  );
}

function placeholderGeometry(shape: Model["shape"]): THREE.BufferGeometry {
  switch (shape) {
    case "icosahedron": return new THREE.IcosahedronGeometry(1, 1);
    case "box": return new THREE.BoxGeometry(1.4, 1.4, 1.4, 1, 1, 1);
    case "cone": return new THREE.ConeGeometry(0.9, 1.8, 48);
    case "cylinder": return new THREE.CylinderGeometry(0.7, 0.7, 1.6, 48);
    case "torus": return new THREE.TorusGeometry(0.9, 0.35, 32, 80);
    case "dodecahedron": return new THREE.DodecahedronGeometry(1);
    case "octahedron": return new THREE.OctahedronGeometry(1);
    case "sphere": return new THREE.SphereGeometry(1, 64, 48);
    case "tetrahedron": return new THREE.TetrahedronGeometry(1.1);
    case "capsule": return new THREE.CapsuleGeometry(0.6, 1.2, 16, 32);
    case "ring": return new THREE.TorusGeometry(1, 0.12, 24, 96);
    default: return new THREE.TorusKnotGeometry(0.8, 0.28, 220, 32);
  }
}

function ShapeObject({ model, material }: { model: Model; material: THREE.Material }) {
  const object = useMemo(
    () => new THREE.Mesh(placeholderGeometry(model.shape), material),
    [model.shape, material],
  );
  return <Fitted object={object} />;
}

function StlObject({ model, material }: { model: Model; material: THREE.Material }) {
  const geometry = useLoader(STLLoader, asset(model.file!));
  const object = useMemo(() => {
    const g = geometry.clone();
    if ((model.upAxis ?? "z") === "z") g.rotateX(-Math.PI / 2);
    g.computeVertexNormals();
    return new THREE.Mesh(g, material);
  }, [geometry, material, model.upAxis]);
  return <Fitted object={object} />;
}

function ThreeMfObject({ model, material }: { model: Model; material: THREE.Material }) {
  const loaded = useLoader(ThreeMFLoader, asset(model.file!));
  const object = useMemo(() => {
    const clone = loaded.clone(true);
    clone.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).material = material;
    });
    const wrapper = new THREE.Group();
    if ((model.upAxis ?? "z") === "z") wrapper.rotation.x = -Math.PI / 2;
    wrapper.add(clone);
    return wrapper;
  }, [loaded, material, model.upAxis]);
  return <Fitted object={object} />;
}

function GlbObject({ model, material }: { model: Model; material: THREE.Material }) {
  const gltf = useGLTF(asset(model.file!));
  const object = useMemo(() => {
    const clone = gltf.scene.clone(true);
    clone.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).material = material;
    });
    return clone;
  }, [gltf, material]);
  return <Fitted object={object} />;
}

const FINISHES: Record<Finish, { metalness: number; roughness: number; clearcoat: number; env: number }> = {
  satin: { metalness: 0, roughness: 0.55, clearcoat: 0.1, env: 1 },
  matte: { metalness: 0, roughness: 0.75, clearcoat: 0, env: 1 },
  // metal reflects the environment, so it needs high metalness and a stronger env
  metal: { metalness: 1, roughness: 0.3, clearcoat: 0, env: 1.6 },
};

export function ModelObject({ model, color, finish = "satin" }: { model: Model; color: string; finish?: Finish }) {
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        roughness: 0.55, // typical FDM/resin surface
        metalness: 0,
        clearcoat: 0.1,
        clearcoatRoughness: 0.6,
      }),
    [],
  );
  useEffect(() => {
    material.color.set(color);
    const f = FINISHES[finish];
    material.metalness = f.metalness;
    material.roughness = f.roughness;
    material.clearcoat = f.clearcoat;
    material.envMapIntensity = f.env;
    material.needsUpdate = true;
  }, [material, color, finish]);
  useEffect(() => () => material.dispose(), [material]);

  const ext = model.file?.split("?")[0].split(".").pop()?.toLowerCase();
  if (!model.file) return <ShapeObject model={model} material={material} />;
  if (ext === "stl") return <StlObject model={model} material={material} />;
  if (ext === "3mf") return <ThreeMfObject model={model} material={material} />;
  return <GlbObject model={model} material={material} />;
}
