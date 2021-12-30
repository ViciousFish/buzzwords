import { Capacitor } from "@capacitor/core";
import classNames from "classnames";
import React from "react";
import Div100vh, { use100vh } from "react-div-100vh";

const useNativeVH = Capacitor.isNativePlatform();

const ScreenHeightWraper: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  style,
  ...props
}) => {
  const height = use100vh();
  const safeAreaBottom = Number(
    getComputedStyle(document.documentElement)
      .getPropertyValue("--sab")
      .replace(/\D/g, "")
  );
  const safeAreaTop = Number(
    getComputedStyle(document.documentElement)
      .getPropertyValue("--sat")
      .replace(/\D/g, "")
  );

  console.log(`${(height ?? 0) - (safeAreaBottom + safeAreaTop)}px`)
  return useNativeVH ? (
    <div
      {...props}
      style={{
        ...style,
        height: height ? `${height - (safeAreaBottom + safeAreaTop)}px` : "100vh",
      }}
    >
      {children}
    </div>
  ) : (
    <Div100vh {...props}>{children}</Div100vh>
  );
};
export default ScreenHeightWraper;
