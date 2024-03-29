import urljoin from "url-join";
import axios from "axios";

axios.defaults.withCredentials = true;

export const getApiUrl = (...path: string[]) =>
  urljoin(String(import.meta.env.VITE_API_PREFIX || "/api"), ...path);

export const SOCKET_DOMAIN = String(import.meta.env.VITE_SOCKET_DOMAIN || "");
export const SOCKET_PATH = String(
  import.meta.env.VITE_SOCKET_PATH || "/socket.io"
);
