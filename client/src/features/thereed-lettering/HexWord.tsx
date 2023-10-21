import { GroupProps } from "@react-three/fiber";
import React, { useRef } from "react";
import HexLetter from "./HexLetter";
import { theme } from "../../app/theme";

interface HexWordProps {
  text: string;
  position?: [number, number, number];
  autoSpin?: boolean;
  color?: string;
}

const HexWord: React.FC<HexWordProps & GroupProps> = ({
  text,
  position,
  autoSpin,
  color,
  ...props
}) => {
  const characters = text.split("");
  const positionOffset = -1 * (((characters.length - 1) * 5.5) / 2);
  return (
    <group
      position={[
        position ? position[0] + positionOffset : positionOffset,
        position ? position[1] : 0,
        position ? position[2] : 0,
      ]}
      {...props}
    >
      {characters.map((character, index) => {
        console.log(theme.light.colors.threed.sunset[index]);
        return (
        <HexLetter
          autoSpin={autoSpin}
          letter={character}
          key={index}
          position={[index * 5.5, 0, 0]}
          index={index}
          color={`springtime.${index * 2}`}
        />
      )})}
    </group>
  );
};

export default HexWord;
