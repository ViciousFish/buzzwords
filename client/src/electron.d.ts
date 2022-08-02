declare interface Window {
  versions?: {
    electron: () => string;
    platform: () => string;
  };
  ipc?: {
    ping: () => string;
    handleLink: (callback: (event: Event, value: string) => void) => void;
  };
}
