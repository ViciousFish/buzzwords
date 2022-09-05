import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { createPortal } from "react-dom";
import TutorialPage from "../onboarding/TutorialPage";

interface SidebarOrFullscreenProps {
  mobileLayout: boolean;
  open: boolean;
}

const RightSidebar = ({}: SidebarOrFullscreenProps) => {
  return (
    <div className="w-[300px] border-l border-gray-500 text-text">
      <div className="h-[50px] bg-primary text-xl flex items-center justify-between px-4">
        <span>Tutorial</span>
        <FontAwesomeIcon icon={faTimes} />
      </div>
      <div className="p-2">
        <TutorialPage />
      </div>
    </div>
  );
};

export default RightSidebar;
