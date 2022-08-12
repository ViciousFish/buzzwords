import React, { ReactNode } from "react";
import { Canvas as ThreeCanvas } from "@react-three/fiber";
import { useContextBridge } from "@react-three/drei";
import { ReactReduxContext } from "react-redux";

import Wrap3d from "./Wrap3d";
import classNames from "classnames";

import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
import { extend } from '@react-three/fiber'


const Canvas: React.FC<{
  className?: string;
  children: ReactNode;
}> = ({ children, className }) => {
  const ReduxProvider = useContextBridge(ReactReduxContext);
  extend({ TextGeometry })

  return (
    <ThreeCanvas
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
        <Wrap3d>{children}</Wrap3d>
      </ReduxProvider>
    </ThreeCanvas>
  );
};
export default Canvas;
