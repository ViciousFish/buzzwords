import React from 'react';
import { useNavigate } from "react-router";

export const useHandleIPCLink = () => {
  const navigate = useNavigate()
  window.ipc?.handleLink((e, data) => {
    const url = new URL(data);
    const path = url.pathname.replace("//", "/");
    if (/^\/loginsuccess[\/]?$/.test(path)) {
      location.reload();
    }
    if (/^\/play\/.*[\/]?$/.test(path)) {
      navigate(path)
    }
  });
}

const IPCRoutingComponent: React.FC = () => {
  useHandleIPCLink();
  return null;
}

export default IPCRoutingComponent;