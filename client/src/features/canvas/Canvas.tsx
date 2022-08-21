import React, { ReactNode } from "react";
import { Canvas as ThreeCanvas } from "@react-three/fiber";
import { useContextBridge } from "@react-three/drei";
import { ReactReduxContext } from "react-redux";

import Wrap3d from "./Wrap3d";
import classNames from "classnames";
import useDimensions from "react-cool-dimensions";

const Canvas: React.FC<{
  className?: string;
  children: ReactNode;
  isGameboard?: boolean;
}> = ({ children, className, isGameboard }) => {
  const ReduxProvider = useContextBridge(ReactReduxContext);
  const { observe, width, height } = useDimensions();

  return (
    <ThreeCanvas
    ref={observe}
      frameloop="demand"
      className={classNames("shrinkable", className)}
      camera={{
        position: [0, 0, 20],
        zoom: 5,
      }}
      gl={{
        powerPreference: "low-power",
      }}
      orthographic
      dpr={Math.max(window.devicePixelRatio, 1)}
      flat
    >
      <ReduxProvider>
        <Wrap3d isGameboard={isGameboard} width={width} height={height}>{children}</Wrap3d>
      </ReduxProvider>
    </ThreeCanvas>
  );
};
export default Canvas;
