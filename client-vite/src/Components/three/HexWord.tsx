import { GroupProps } from "@react-three/fiber";
import React from "react";
import HexLetter from "./HexLetter";

interface HexWordProps {
  text: string;
}

const HexWord: React.FC<HexWordProps & GroupProps> = ({
  text,
  ...props
}) => {
  const characters = text.split("");
  return (
    <group
      position={[-1 * (((characters.length - 1) * 5.5) / 2), 0, 0]}
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
