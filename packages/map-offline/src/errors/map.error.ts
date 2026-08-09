export class MapError extends Error {
  constructor(message: string, public readonly code: string = "MAP_ERROR") {
    super(message);
    this.name = "MapError";
  }
}

export class TileLoadError extends MapError {
  constructor(message: string) {
    super(message, "TILE_LOAD_ERROR");
    this.name = "TileLoadError";
  }
}

export class EngineInitError extends MapError {
  constructor(message: string) {
    super(message, "ENGINE_INIT_ERROR");
    this.name = "EngineInitError";
  }
}
