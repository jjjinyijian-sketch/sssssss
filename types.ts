
export enum TreeState {
  TREE = 'TREE',
  EXPLODE = 'EXPLODE'
}

export interface HandGestureData {
  gesture: 'fist' | 'open' | 'pinch' | 'none';
  x: number; // 0 to 1
  y: number; // 0 to 1
  rotation: number; // -1 to 1 based on horizontal movement
}
