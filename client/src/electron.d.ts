declare interface Window {
  versions?: {
    electron: () => string;
    platform: () => string;
  }
}