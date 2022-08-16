import React from "react";
import { use100vh } from "react-div-100vh";


interface ScreenHeightWrapperProps {
  insetTop?: number;
}

const ScreenHeightWraper: React.FC<
  React.HTMLAttributes<HTMLDivElement> & ScreenHeightWrapperProps
> = ({ insetTop, children, style, ...props }) => {
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

  return (
    <div
      {...props}
      style={{
        ...style,
        height: height
          ? `${height - (safeAreaBottom + safeAreaTop + (insetTop ?? 0))}px`
          : "100vh",
      }}
    >
      {children}
    </div>
  )
};
export default ScreenHeightWraper;
