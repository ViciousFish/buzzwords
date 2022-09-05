import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { createPortal } from "react-dom";

interface SidebarOrFullscreenProps {
  mobileLayout: boolean;
  open: boolean;
}

const SidebarOrFullscreen = ({}: SidebarOrFullscreenProps) => {
  return (
    <div className="w-[300px] border-l border-black">
      <div className="h-[50px] bg-primary text-xl flex items-center justify-between px-4">
        <span>Tutorial</span>
        <FontAwesomeIcon icon={faTimes} />
      </div>
      <div className="p-2">

      <h3>Welcome to Buzzwords!</h3>
      </div>
    </div>
  );
};

export default SidebarOrFullscreen;
