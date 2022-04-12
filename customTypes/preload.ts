export interface IElectronAPI {
  preloadTest: () => Promise<string>,
  staticUrl: string,
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}