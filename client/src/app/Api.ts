import axios, { AxiosRequestConfig } from "axios";
import { retrieveAuthToken } from "../features/user/userActions";

export class Api {

  static get<T>(url: string, config?: AxiosRequestConfig) {
    const authToken = retrieveAuthToken();
    return axios.get<T>(url, {
      ...config,
      headers: {
        ...config?.headers,
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : null),
      },
    });
  }
  static post<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    const authToken = retrieveAuthToken();
    return axios.post<T>(url, data, {
      ...config,
      headers: {
        ...config?.headers,
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : null),
      },
    });
  }
}
