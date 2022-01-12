import urljoin from "url-join";
import axios from "axios";

axios.defaults.withCredentials = true;

export const getApiUrl = (...path: string[]) =>
  urljoin(
    String(import.meta.env.VITE_API_PREFIX || "http://localhost:8080/api"),
    ...path
  );

export const SOCKET_DOMAIN = String(
  import.meta.env.VITE_SOCKET_DOMAIN || "http://localhost:8080"
);
export const SOCKET_PATH = String(
  import.meta.env.VITE_SOCKET_PATH || "/socket.io"
);
