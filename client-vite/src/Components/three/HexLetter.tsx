import React, { useMemo, useRef, useLayoutEffect } from "react";
import { Vector3 } from "three";
import { useLoader } from "@react-three/fiber";
import { FontLoader } from "three";
import HexTile from "./HexTile";
import fredokaone from "../../../assets/Fredoka One_Regular.json?url";
import { theme } from "../../theme";

interface HexLetterProps {
  position: Vector3 | undefined;
  letter: string;
}

// Computing text positions: https://codesandbox.io/s/r3f-gltf-fonts-c671i?file=/src/Text.js:326-516

const HexLetter: React.FC<HexLetterProps> = ({ letter, ...props }) => {
  const font = useLoader(FontLoader, fredokaone);
  const config = useMemo(
    () => ({
      font,
      size: 3,
      height: 1,
      curveSegments: 32,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.1,
      bevelOffset: 0,
      bevelSegments: 3,
    }),
    [font]
  );
  const mesh = useRef();
  useLayoutEffect(() => {
    const size = new Vector3();
    if (mesh.current !== undefined) {
      mesh.current.geometry.computeBoundingBox();
      mesh.current.geometry.boundingBox.getSize(size);
      // Mesh.current.position.x = hAlign === 'center' ? -size.x / 2 : hAlign === 'right' ? 0 : -size.x;
      mesh.current.position.x = -size.x / 2;
      // Mesh.current.position.y = vAlign === 'center' ? -size.y / 2 : vAlign === 'top' ? 0 : -size.y;
      mesh.current.position.y = -size.y / 2;
    }
  }, [letter]);
  return (
    <group {...props}>
      <mesh
        ref={mesh}
        // Position={[-1.5, -1.5, 0]}
      >
        <textGeometry args={[letter, config]} />
        {/* <meshNormalMaterial */}
        <meshStandardMaterial
          // ToneMapped={false}
          color={theme.colors.darkbrown}
        />
      </mesh>
      <HexTile />
    </group>
  );
};

export default HexLetter;
