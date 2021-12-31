import urljoin from "url-join";
import { Capacitor } from "@capacitor/core";

export const DEFAULT_API_PREFIXES = {
  web: "/api",
  mobile: "https://buzzwords.gg/api",
};

export const SOCKET_URLS = {
  web: "/socket.io",
  mobile: "https://buzzwords.gg/socket.io",
};

export const apiPrefix =
  import.meta.env.VITE_API_PREFIX
  // DEFAULT_API_PREFIXES[Capacitor.isNativePlatform() ? "mobile" : "web"];

export const socketUrl =
  import.meta.env.VITE_SOCKET_URL ||
  SOCKET_URLS[Capacitor.isNativePlatform() ? "mobile" : "web"];

export const getApiUrl = (...path: string[]) =>
  urljoin(String(apiPrefix), ...path);
