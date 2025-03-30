import React, { useRef } from "react";
import {
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  DirectionalLight,
  AmbientLight,
  PlaneGeometry,
  ACESFilmicToneMapping,
} from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { extend, createRoot, events, ReconcilerRoot } from "@react-three/fiber";
import { useContextBridge } from "@react-three/drei";
import { ReactReduxContext } from "react-redux";
import useDimensions from "react-cool-dimensions";

import Wrap3d from "./Wrap3d";
import { useEffect } from "hoist-non-react-statics/node_modules/@types/react";

extend({
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  DirectionalLight,
  AmbientLight,
  TextGeometry,
  PlaneGeometry,
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
        // toneMapping: ACESFilmicToneMapping,
        // toneMappingExposure: 1.5,
      },
      // dpr: Math.max(window.devicePixelRatio, 1),
      dpr: 0.4,
    });
    root.current.render(
      <ReduxProvider>
        <Wrap3d isGameboard={isGameboard}>{children}</Wrap3d>
      </ReduxProvider>
    );
  }
  // useEffect(() => {
  //   const canvas = canvasRef.current;
  //   if (canvas) {
  //     const ctx = canvas.getContext("webgl"); 
  //     if (ctx) {
  //       ctx.imageSmoothingEnabled = false;
  //     }
  //   }
  // }, []);
  return (
    <div className={isGameboard ? "aspect-[9/10] p-4 w-full relative" : "w-full h-full relative"}>
      <div className="w-full h-full" ref={observe}>
        <canvas style={{ imageRendering: "pixelated" }} ref={canvasRef} />
      </div>
    </div>
  );
});
