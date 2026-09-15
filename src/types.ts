export type GameState = 
  | 'MAIN_MENU'
  | 'LEVEL_SELECT'
  | 'HOW_TO_PLAY'
  | 'PLAYING'
  | 'QUESTION_MODAL'
  | 'DOOR_CODE'
  | 'LEVEL_COMPLETE'
  | 'GAME_COMPLETE';

export interface Puzzle {
  id: number; // 1 to 5
  name: string; // e.g. "Meja Belajar", "Papan Tulis"
  icon: string; // visual representation identifier
  x: number; // room coordinate
  y: number;
  width: number;
  height: number;
  question: string;
  answer: number;
  hint: number; // 0-9 single digit
  solved: boolean;
  explanation?: string;
}

export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
  color?: string;
  label?: string;
}

export interface Door {
  x: number;
  y: number;
  width: number;
  height: number;
  isOpen: boolean;
}

export interface LevelData {
  id: number;
  name: string;
  roomType: 'bedroom' | 'livingroom' | 'office' | 'library' | 'classroom';
  roomTitle: string;
  description: string;
  difficulty: 'Mudah' | 'Mudah+' | 'Sedang' | 'Sedang+' | 'Tantangan';
  floorTheme: {
    primaryColor: string;
    secondaryColor: string;
    pattern: 'wood' | 'tiles' | 'carpet' | 'checkered';
    wallColor: string;
    wallTrimColor: string;
  };
  door: Door;
  playerStart: { x: number; y: number };
  puzzles: Puzzle[];
  obstacles: Obstacle[];
}

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  facing: 'up' | 'down' | 'left' | 'right';
  isMoving: boolean;
  walkFrame: number;
}

export interface GameProgress {
  unlockedLevels: number[]; // e.g. [1, 2]
  completedLevels: number[]; // e.g. [1]
  bestTimes: Record<number, number>; // levelId -> seconds
}
