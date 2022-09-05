import React from 'react';
import { createPortal } from 'react-dom';

interface SidebarOrFullscreenProps {
  mobileLayout: boolean;
  open: boolean;
}

const SidebarOrFullscreen = ({}: SidebarOrFullscreenProps) => {
  return <div className="bg-blue-400 w-[300px]">hello</div>;
}

export default SidebarOrFullscreen;