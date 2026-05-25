import { useLayoutEffect, useMemo, useRef } from 'react';
import { Color, InstancedMesh, Matrix4, Object3D } from 'three';
import { clamp, EARTH_RADIUS_KM, KM_TO_SCENE } from '../utils/math';

type DebrisCloudProps = {
  positionsKm?: Float32Array;
  highlightedIndex?: number | null;
  riskPulse?: boolean;
};

const baseColor = new Color();
const highlightColor = new Color('#ff4d6d');
const syntheticColor = new Color('#ff9b3d');

export default function DebrisCloud({
  positionsKm,
  highlightedIndex,
  riskPulse = false,
}: DebrisCloudProps) {
  const meshRef = useRef<InstancedMesh>(null);
  const helper = useMemo(() => new Object3D(), []);
  const hiddenMatrix = useMemo(() => new Matrix4().makeScale(0, 0, 0), []);
  const count = positionsKm ? positionsKm.length / 3 : 0;

  useLayoutEffect(() => {
    const mesh = meshRef.current;

    if (!mesh || !positionsKm) {
      return;
    }

    for (let index = 0; index < count; index += 1) {
      const offset = index * 3;
      const x = positionsKm[offset];
      const y = positionsKm[offset + 1];
      const z = positionsKm[offset + 2];

      if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) {
        mesh.setMatrixAt(index, hiddenMatrix);
        mesh.setColorAt(index, baseColor.set('#17324d'));
        continue;
      }

      helper.position.set(x * KM_TO_SCENE, z * KM_TO_SCENE, -y * KM_TO_SCENE);
      const altitudeKm = Math.hypot(x, y, z) - EARTH_RADIUS_KM;
      const altitudeTone = clamp((altitudeKm - 250) / 2100, 0, 1);
      const scale = highlightedIndex === index ? (riskPulse ? 0.052 : 0.044) : 0.014 + altitudeTone * 0.011;
      helper.scale.setScalar(scale);
      helper.updateMatrix();
      mesh.setMatrixAt(index, helper.matrix);

      if (highlightedIndex === index) {
        mesh.setColorAt(index, riskPulse ? highlightColor : syntheticColor);
      } else {
        baseColor.setHSL(0.082 + altitudeTone * 0.035, 0.92, 0.52 + altitudeTone * 0.2);
        mesh.setColorAt(index, baseColor);
      }
    }

    mesh.instanceMatrix.needsUpdate = true;

    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  }, [count, helper, highlightedIndex, hiddenMatrix, positionsKm, riskPulse]);

  if (!count) {
    return null;
  }

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}
