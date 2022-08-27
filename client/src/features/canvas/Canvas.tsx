import React, { useRef } from "react";
import * as THREE from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { extend, createRoot, events, ReconcilerRoot } from "@react-three/fiber";
import { useContextBridge } from "@react-three/drei";
import { ReactReduxContext } from "react-redux";
import useDimensions from "react-cool-dimensions";

import Wrap3d from "./Wrap3d";

extend({
  ...THREE,
  TextGeometry,
});
interface BaseCanvasProps {
  children: React.ReactNode;
  isGameboard?: boolean;
}

export default React.memo(function BaseCanvas({
  children,
  isGameboard,
}: BaseCanvasProps) {
  const ReduxProvider = useContextBridge(ReactReduxContext);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const root = React.useRef<ReconcilerRoot<HTMLElement>>(null!);

  const { observe, width, height } = useDimensions();

  if (canvasRef.current) {
    if (!root.current) {
      root.current = createRoot<HTMLElement>(canvasRef.current);
    }
    root.current.configure({
      size: { width, height, top: 0, left: 0 },
      events,
      orthographic: true,
      camera: {
        position: [0, 0, 20],
        zoom: 5,
      },
      flat: true,
      frameloop: "demand",
      gl: {
        powerPreference: "low-power",
      },
      dpr: Math.max(window.devicePixelRatio, 1),
    });
    root.current.render(
      <ReduxProvider>
        <Wrap3d isGameboard={isGameboard}>
          {children}
        </Wrap3d>
      </ReduxProvider>
    );
  }
  return (
    <div className="h-full w-full relative">
      <div className="w-full h-full" ref={observe}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
});
