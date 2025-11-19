import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Edges } from "@react-three/drei";
import React, { useMemo, useState, useRef } from "react";
import * as THREE from "three";

type ShapeKind = "box" | "tri" | "penta" | "hexa";

type ShapeConfig = {
  id: number;
  kind: ShapeKind;
  position: [number, number, number];
  rotation: [number, number, number];
  size: number;
  color: string;
  lineWidth: number;
};

const SHAPE_KINDS: ShapeKind[] = ["box", "tri", "penta", "hexa"];

// ランダムな色（HSL）を作るヘルパー
function randomColor() {
  const h = Math.random() * 360;
  const s = 60 + Math.random() * 20; // 60–80%
  const l = 45 + Math.random() * 20; // 45–65%
  return `hsl(${h}, ${s}%, ${l}%)`;
}

// ランダムな回転ベクトルを作る
function randomRotationVector(): [number, number, number] {
  return [
    (Math.random() - 0.5) * 0.005, // x
    (Math.random() - 0.5) * 0.005, // y
    (Math.random() - 0.5) * 0.005, // z
  ];
}

// 図形 1 個分のランダム設定を作る
function createRandomShapeConfig(id: number): ShapeConfig {
  const kind = SHAPE_KINDS[Math.floor(Math.random() * SHAPE_KINDS.length)];

  const position: [number, number, number] = [
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 10,
  ];

  const rotation: [number, number, number] = [
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    Math.random() * Math.PI,
  ];

  const size = 0.5 + Math.random() * 2.5;
  const color = randomColor();
  const lineWidth = 2 + Math.random() * 3; // 2〜5くらい

  return { id, kind, position, rotation, size, color, lineWidth };
}

// 1 個の図形を描画するコンポーネント
function RandomShape({ config }: { config: ShapeConfig }) {
  const { kind, position, rotation, size, color, lineWidth } = config;

  if (kind === "box") {
    return (
      <mesh position={position} rotation={rotation}>
        <boxGeometry args={[size, size, size]} />
        <meshBasicMaterial transparent opacity={0} />
        <Edges color={color} linewidth={lineWidth} />
      </mesh>
    );
  }

  let radialSegments = 3;
  if (kind === "penta") radialSegments = 5;
  if (kind === "hexa") radialSegments = 6;

  const height = size * 0.3;

  return (
    <mesh position={position} rotation={rotation}>
      <cylinderGeometry args={[size, size, height, radialSegments]} />
      <meshBasicMaterial transparent opacity={0} />
      <Edges color={color} linewidth={lineWidth} />
    </mesh>
  );
}

// Canvas の中身。useFrame はここで使う
function Scene() {
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  // 不規則回転用のグループ
  const groupRef = useRef<THREE.Group | null>(null);

  // 現在の回転ベクトル
  const [rotationVector, setRotationVector] = useState<[number, number, number]>(
    () => randomRotationVector()
  );

  // マウント時に 50 個分の図形設定をランダム生成（再レンダーで変わらないよう useMemo）
  const shapes = useMemo<ShapeConfig[]>(() => {
    const count = 50;
    return Array.from({ length: count }, (_, i) =>
      createRandomShapeConfig(i)
    );
  }, []);

  // ユーザーが触っていない間だけ group を不規則に回転
  useFrame(() => {
    if (!groupRef.current) return;
    if (!isUserInteracting) {
      groupRef.current.rotation.x += rotationVector[0];
      groupRef.current.rotation.y += rotationVector[1];
      groupRef.current.rotation.z += rotationVector[2];
    }
  });

  return (
    <>
      <ambientLight />

      {/* 図形全体を group にまとめて回転させる */}
      <group ref={groupRef}>
        {shapes.map((cfg) => (
          <RandomShape key={cfg.id} config={cfg} />
        ))}
      </group>

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        autoRotate={false} // 自前で回しているので使わない
        onStart={() => {
          setIsUserInteracting(true);
        }}
        onEnd={() => {
          setTimeout(() => {
            // 触るのをやめて少し経ったら次のランダム回転へ
            setRotationVector(randomRotationVector());
            setIsUserInteracting(false);
          }, 1000);
        }}
      />
    </>
  );
}

function App() {
  return (
    <Canvas
      style={{ width: "100vw", height: "100vh", background: "black" }}
      camera={{ position: [8, 8, 8], fov: 50 }}
    >
      <Scene />
    </Canvas>
  );
}

export default App;
