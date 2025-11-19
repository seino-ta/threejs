import { Canvas } from "@react-three/fiber";
import { OrbitControls, Edges } from "@react-three/drei";
import * as THREE from "three";

function DistortedBox({
  size,
  color,
  offset = 0.8,
}: {
  size: [number, number, number];
  color: string;
  offset?: number;
}) {
  // geometry が生成/更新されたタイミングで頂点をいじる
  const distortGeometry = (geo: THREE.BufferGeometry) => {
    const pos = geo.attributes.position as THREE.BufferAttribute;

    for (let i = 0; i < pos.count; i++) {
      pos.setXYZ(
        i,
        pos.getX(i) + (Math.random() - 0.5) * offset,
        pos.getY(i) + (Math.random() - 0.5) * offset,
        pos.getZ(i) + (Math.random() - 0.5) * offset
      );
    }

    pos.needsUpdate = true;
    geo.computeVertexNormals();
  };

  return (
    <mesh>
      <boxGeometry
        args={size}
        // ここで一回だけ歪ませる
        onUpdate={(geo) => distortGeometry(geo as THREE.BufferGeometry)}
      />
      {/* 中身は透明 */}
      <meshBasicMaterial transparent opacity={0} />
      {/* 親 mesh の geometry を使って枠線だけ描画 */}
      <Edges color={color} />
    </mesh>
  );
}

export default function App() {
  return (
    <Canvas
      style={{ width: "100vw", height: "100vh" }}
      camera={{ position: [5, 5, 5], fov: 50 }}
    >
      <ambientLight />

      {/* 赤 > 黄 > 青 の順で大きい → 小さい */}
      <DistortedBox size={[3, 3, 3]} color="red" offset={0.8} />
      <DistortedBox size={[2, 2, 2]} color="yellow" offset={0.6} />
      <DistortedBox size={[1, 1, 1]} color="blue" offset={0.4} />

      <OrbitControls />
    </Canvas>
  );
}
