import urljoin from "url-join";
import axios from "axios";

axios.defaults.withCredentials = true;

export const getApiUrl = (...path: string[]) =>
  urljoin(
    String(import.meta.env.VITE_API_PREFIX || "http://localhost:8080/api"),
    ...path
  );

export const SOCKET_URL = String(import.meta.env.VITE_SOCKET_URL) || "http://localhost:8080"