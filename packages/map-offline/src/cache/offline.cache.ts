export interface TileCacheEntry {
  url: string;
  data: ArrayBuffer;
  timestamp: number;
}

export class OfflineTileCache {
  private readonly CACHE_NAME = "marg-offline-tiles-v1";

  async put(url: string, response: Response): Promise<void> {
    const cache = await caches.open(this.CACHE_NAME);
    await cache.put(url, response);
  }

  async match(url: string): Promise<Response | undefined> {
    const cache = await caches.open(this.CACHE_NAME);
    return await cache.match(url);
  }

  async clear(): Promise<void> {
    await caches.delete(this.CACHE_NAME);
  }
}
