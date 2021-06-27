import { GroupProps } from "@react-three/fiber";
import React from "react";
import HexLetter from "./HexLetter";

interface HexWordProps {
  text: string;
}

const HexWord: React.FC<HexWordProps & GroupProps> = ({
  text,
  position,
  ...props
}) => {
  const characters = text.split("");
  const positionOffset = -1 * (((characters.length - 1) * 5.5) / 2);
  return (
    <group
      position={[
        position && Array.isArray(position)
          ? position[0] + positionOffset
          : positionOffset,
        position && Array.isArray(position) ? position[1] : 0,
        position && Array.isArray(position) ? position[2] : 0,
      ]}
      {...props}
    >
      {characters.map((character, index) => (
        <HexLetter
          letter={character}
          key={index}
          position={[index * 5.5, 0, 0]}
        />
      ))}
    </group>
  );
};

export default HexWord;
