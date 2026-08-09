import { OfflineTileCache } from "../cache/offline.cache";
import { TileLoadError } from "../errors/map.error";

export class TileManager {
  constructor(private cache: OfflineTileCache) {}

  public async fetchTile(url: string, useCache: boolean = true): Promise<Response> {
    if (useCache) {
      const cachedResponse = await this.cache.match(url);
      if (cachedResponse) {
        return cachedResponse;
      }
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new TileLoadError(`Failed to fetch tile: ${response.statusText}`);
      }
      
      if (useCache) {
        // Clone response before caching so it can still be consumed
        await this.cache.put(url, response.clone());
      }
      
      return response;
    } catch (error: any) {
      throw new TileLoadError(error.message);
    }
  }
}
