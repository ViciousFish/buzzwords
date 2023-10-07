import React, { useState } from "react";
import Canvas from "../canvas/Canvas";
import { IconWatch01 } from "../../assets/IconWatch01";
import { SMIconTick01 } from "../../assets/SM_Icon_Tick_01";
import { Outlines } from "@react-three/drei";
import { useSpring, animated } from "@react-spring/three";

interface TimerButtonProps {
  value: boolean;
  onChange: (v: boolean) => void;
}

export function TimerButton({ value, onChange }: TimerButtonProps) {
  const [hover, setHover] = useState(false);
  const scaleSpring = useSpring({
    scale: value ? [1.1, 1.1, 1.1] : ( hover ? [0.9,0.9,0.9] : [0.8, 0.8, 0.8]),
  });
  // const rotationSpring = useSpring();
  return (
    <div className="relative">
      <div
        className={value ? "bg-blue-500" : ""}
        style={{
          height: "150px",
          width: "150px",
          top: "30px",
          left: "15px",
          position: "absolute",
          padding: "0",
          borderRadius: "50%",
        }}
      ></div>

      <div
        style={{
          height: "180px",
          width: "180px",
          position: "relative",
        }}
      >
        <Canvas>
          <animated.group onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)} {...scaleSpring}>
            <IconWatch01
              position={[0, -0.25, 0]}
              onClick={() => onChange(!value)}
              scale={[5, 5, 5]}
            />
            {value && (
              <SMIconTick01 scale={[3, 3, 3]} position={[-0.3, -0.5, 0.5]}>
                <meshStandardMaterial color={"green"} />
              </SMIconTick01>
            )}
          </animated.group>
        </Canvas>
      </div>
    </div>
  );
}
