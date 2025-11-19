import { Canvas } from "@react-three/fiber";
import { OrbitControls, Edges } from "@react-three/drei";
import { useMemo, useState } from "react";

type ShapeKind = "box" | "tri" | "penta" | "hexa";

type ShapeConfig = {
  id: number;
  kind: ShapeKind;
  position: [number, number, number];
  rotation: [number, number, number];
  size: number;
  color: string;
  lineWidth: number; // ← 追加
};

const SHAPE_KINDS: ShapeKind[] = ["box", "tri", "penta", "hexa"];

// ランダムな色（HSL）を作るヘルパー
function randomColor() {
  const h = Math.random() * 360;
  const s = 60 + Math.random() * 20; // 60–80%
  const l = 45 + Math.random() * 20; // 45–65%
  return `hsl(${h}, ${s}%, ${l}%)`;
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

  const lineWidth = 2 + Math.random() * 3; // ← 太さもここで決めておく

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


function App() {
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  // マウント時に 50 個分の図形設定をランダム生成（再レンダーで変わらないよう useMemo）
  const shapes = useMemo<ShapeConfig[]>(() => {
    const count = 50;
    return Array.from({ length: count }, (_, i) =>
      createRandomShapeConfig(i)
    );
  }, []);

  return (
    <Canvas
      style={{ width: "100vw", height: "100vh", background: "black" }}
      camera={{ position: [8, 8, 8], fov: 50 }}
    >
      <ambientLight />

      {shapes.map((cfg) => (
        <RandomShape key={cfg.id} config={cfg} />
      ))}

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        autoRotate={!isUserInteracting}      // 触っていない間だけ自動回転
        autoRotateSpeed={0.5}                // 回転速度（好みで調整）

        // ユーザーがドラッグを開始した
        onStart={() => setIsUserInteracting(true)}
        // ユーザーが操作をやめたら、少し時間をおいて自動回転を再開
        onEnd={() => {
          setTimeout(() => {
            setIsUserInteracting(false);
          }, 1000); // 3秒放置でまた回り始める（好みで変更）
        }}
      />
    </Canvas>
  );
}

export default App;
