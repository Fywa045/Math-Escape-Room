import React, { useEffect, useRef, useState, useCallback } from 'react';
import { LevelData, Puzzle, Player } from '../types';
import { ROOM_WIDTH, ROOM_HEIGHT, WALL_THICKNESS } from '../data/levels';
import { sounds } from '../utils/audio';

interface GameCanvasProps {
  level: LevelData;
  onInteractPuzzle: (puzzle: Puzzle) => void;
  onInteractDoor: () => void;
  onDoorLockedNotice: () => void;
  virtualDirection: { x: number; y: number } | null;
  virtualInteractTrigger: number;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  level,
  onInteractPuzzle,
  onInteractDoor,
  onDoorLockedNotice,
  virtualDirection,
  virtualInteractTrigger,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Player state reference for the 60fps loop
  const playerRef = useRef<Player>({
    x: level.playerStart.x,
    y: level.playerStart.y,
    width: 26,
    height: 26,
    speed: 3.5,
    facing: 'down',
    isMoving: false,
    walkFrame: 0,
  });

  // Track key states
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const [promptMessage, setPromptMessage] = useState<{
    text: string;
    type: 'puzzle' | 'door';
    targetId?: number;
  } | null>(null);

  // Reset player start on level change
  useEffect(() => {
    playerRef.current.x = level.playerStart.x;
    playerRef.current.y = level.playerStart.y;
    playerRef.current.facing = 'down';
    playerRef.current.isMoving = false;
  }, [level.id, level.playerStart.x, level.playerStart.y]);

  // Keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for arrow keys & space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
      keysRef.current[e.key.toLowerCase()] = true;
      keysRef.current[e.code] = true;

      // Check interaction key (E or Space or Enter)
      if (e.key.toLowerCase() === 'e' || e.code === 'Space' || e.code === 'Enter') {
        attemptInteraction();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
      keysRef.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [level]);

  // Respond to virtual interact button (mobile D-Pad)
  useEffect(() => {
    if (virtualInteractTrigger > 0) {
      attemptInteraction();
    }
  }, [virtualInteractTrigger]);

  // Proximity & collision logic
  const checkCollision = (x: number, y: number, w: number, h: number): boolean => {
    // 1. Outer room walls
    if (x < WALL_THICKNESS) return true;
    if (x + w > ROOM_WIDTH - WALL_THICKNESS) return true;
    if (y < WALL_THICKNESS) {
      // Allow moving close to door at top wall
      const isAtDoorOpening =
        x + w > level.door.x - 8 && x < level.door.x + level.door.width + 8;
      if (!isAtDoorOpening) return true;
      if (y < WALL_THICKNESS - 12) return true;
    }
    if (y + h > ROOM_HEIGHT - WALL_THICKNESS) return true;

    // Small 2.5px margin so player smoothly glides around corners
    const margin = 2.5;

    // 2. Obstacles
    for (const obs of level.obstacles) {
      if (
        x + margin < obs.x + obs.width &&
        x + w - margin > obs.x &&
        y + margin < obs.y + obs.height &&
        y + h - margin > obs.y
      ) {
        return true;
      }
    }

    // 3. Puzzles (furniture pieces)
    for (const p of level.puzzles) {
      if (
        x + margin < p.x + p.width &&
        x + w - margin > p.x &&
        y + margin < p.y + p.height &&
        y + h - margin > p.y
      ) {
        return true;
      }
    }

    return false;
  };

  // Calculate distance from player center to nearest point on a rectangular object
  const distanceToRect = (
    px: number,
    py: number,
    rx: number,
    ry: number,
    rw: number,
    rh: number
  ): number => {
    const closestX = Math.max(rx, Math.min(px, rx + rw));
    const closestY = Math.max(ry, Math.min(py, ry + rh));
    return Math.hypot(px - closestX, py - closestY);
  };

  const getNearbyInteractable = useCallback(() => {
    const p = playerRef.current;
    const px = p.x + p.width / 2;
    const py = p.y + p.height / 2;

    // Check Door proximity using edge distance
    const distToDoor = distanceToRect(
      px,
      py,
      level.door.x,
      level.door.y,
      level.door.width,
      level.door.height + 15
    );

    if (distToDoor < 55) {
      return { type: 'door' as const };
    }

    // Check Puzzle proximity using edge distance (guarantees reachability on ANY size furniture)
    for (const puzzle of level.puzzles) {
      const dist = distanceToRect(
        px,
        py,
        puzzle.x,
        puzzle.y,
        puzzle.width,
        puzzle.height
      );

      if (dist < 55) {
        return { type: 'puzzle' as const, puzzle };
      }
    }

    return null;
  }, [level]);

  const attemptInteraction = useCallback(() => {
    const nearby = getNearbyInteractable();
    if (!nearby) return;

    if (nearby.type === 'puzzle' && nearby.puzzle) {
      sounds.playInteract();
      onInteractPuzzle(nearby.puzzle);
    } else if (nearby.type === 'door') {
      const allSolved = level.puzzles.every((pz) => pz.solved);
      if (allSolved) {
        sounds.playInteract();
        onInteractDoor();
      } else {
        sounds.playWrong();
        onDoorLockedNotice();
      }
    }
  }, [getNearbyInteractable, level.puzzles, onInteractPuzzle, onInteractDoor, onDoorLockedNotice]);

  // Main 60fps Game Loop
  useEffect(() => {
    let animationFrameId: number;
    let tick = 0;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      tick++;
      const p = playerRef.current;

      // 1. Compute velocity from keyboard or virtual joystick
      let dx = 0;
      let dy = 0;

      if (keysRef.current['arrowup'] || keysRef.current['w']) dy -= 1;
      if (keysRef.current['arrowdown'] || keysRef.current['s']) dy += 1;
      if (keysRef.current['arrowleft'] || keysRef.current['a']) dx -= 1;
      if (keysRef.current['arrowright'] || keysRef.current['d']) dx += 1;

      // Virtual D-pad override if active
      if (virtualDirection && (virtualDirection.x !== 0 || virtualDirection.y !== 0)) {
        dx = virtualDirection.x;
        dy = virtualDirection.y;
      }

      // Normalize diagonal speed
      if (dx !== 0 && dy !== 0) {
        dx *= 0.7071;
        dy *= 0.7071;
      }

      const isMoving = dx !== 0 || dy !== 0;
      p.isMoving = isMoving;

      if (isMoving) {
        p.walkFrame = (p.walkFrame + 0.18) % (Math.PI * 2);

        // Determine facing direction
        if (Math.abs(dx) > Math.abs(dy)) {
          p.facing = dx > 0 ? 'right' : 'left';
        } else {
          p.facing = dy > 0 ? 'down' : 'up';
        }

        // Apply movement with independent X and Y sliding collision
        const moveX = dx * p.speed;
        const moveY = dy * p.speed;

        if (!checkCollision(p.x + moveX, p.y, p.width, p.height)) {
          p.x += moveX;
        }
        if (!checkCollision(p.x, p.y + moveY, p.width, p.height)) {
          p.y += moveY;
        }
      }

      // Check proximity prompt for UI
      const nearby = getNearbyInteractable();
      if (nearby) {
        if (nearby.type === 'puzzle' && nearby.puzzle) {
          setPromptMessage({
            text: `Tekan [E] Buka Soal #${nearby.puzzle.id}`,
            type: 'puzzle',
            targetId: nearby.puzzle.id,
          });
        } else if (nearby.type === 'door') {
          const allSolved = level.puzzles.every((pz) => pz.solved);
          setPromptMessage({
            text: allSolved
              ? 'Tekan [E] Masukkan Kode Pintu'
              : 'Pintu Terkunci (Selesaikan 5 Soal)',
            type: 'door',
          });
        }
      } else {
        setPromptMessage(null);
      }

      // ==========================================
      // DRAWING
      // ==========================================

      // 1. Background / Floor
      drawFloor(ctx, level);

      // 2. Door Area & Door Frame
      drawDoor(ctx, level, tick);

      // 3. Obstacles (Furniture without questions)
      for (const obs of level.obstacles) {
        drawObstacle(ctx, obs, level.roomType);
      }

      // 4. Puzzles (Interactive furniture pieces)
      for (const puzzle of level.puzzles) {
        drawPuzzleStation(ctx, puzzle, tick, level.roomType);
      }

      // 5. Walls & Wall Shadows
      drawWalls(ctx, level);

      // 6. Player Character
      drawPlayer(ctx, p, tick);

      // 7. Floating interaction prompt badge on canvas
      if (nearby) {
        drawInteractBubble(ctx, nearby, tick);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [level, getNearbyInteractable, virtualDirection]);

  // Click on canvas to interact if clicking on a puzzle
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = ROOM_WIDTH / rect.width;
    const scaleY = ROOM_HEIGHT / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Check if clicked near a puzzle (generous 25px radius)
    for (const puzzle of level.puzzles) {
      if (
        clickX >= puzzle.x - 25 &&
        clickX <= puzzle.x + puzzle.width + 25 &&
        clickY >= puzzle.y - 25 &&
        clickY <= puzzle.y + puzzle.height + 25
      ) {
        sounds.playInteract();
        onInteractPuzzle(puzzle);
        return;
      }
    }

    // Check if clicked near door
    if (
      clickX >= level.door.x - 30 &&
      clickX <= level.door.x + level.door.width + 30 &&
      clickY >= level.door.y - 10 &&
      clickY <= level.door.y + level.door.height + 45
    ) {
      const allSolved = level.puzzles.every((pz) => pz.solved);
      if (allSolved) {
        sounds.playInteract();
        onInteractDoor();
      } else {
        sounds.playWrong();
        onDoorLockedNotice();
      }
      return;
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center select-none">
      {/* Canvas wrapper with responsive aspect ratio */}
      <div className="relative w-full overflow-hidden rounded-2xl border-2 border-slate-700/80 bg-slate-950 shadow-2xl">
        <canvas
          ref={canvasRef}
          width={ROOM_WIDTH}
          height={ROOM_HEIGHT}
          onClick={handleCanvasClick}
          className="w-full h-auto block cursor-pointer"
        />

        {/* Action Prompt Toast at Bottom */}
        {promptMessage && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-in fade-in zoom-in-95 duration-200">
            <div
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold tracking-wide uppercase shadow-xl backdrop-blur-md border flex items-center gap-2 ${
                promptMessage.type === 'door'
                  ? 'bg-amber-500/90 text-slate-950 border-amber-300'
                  : 'bg-slate-900/90 text-amber-300 border-amber-500/50'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping inline-block" />
              <span>{promptMessage.text}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// CANVAS ARTWORK RENDERING HELPERS
// ============================================================================

function drawFloor(ctx: CanvasRenderingContext2D, level: LevelData) {
  const { pattern, primaryColor, secondaryColor } = level.floorTheme;

  // Base floor
  ctx.fillStyle = primaryColor;
  ctx.fillRect(0, 0, ROOM_WIDTH, ROOM_HEIGHT);

  if (pattern === 'wood') {
    // Parquet planks
    ctx.strokeStyle = secondaryColor;
    ctx.lineWidth = 1;
    const plankWidth = 50;
    const plankHeight = 25;
    for (let y = WALL_THICKNESS; y < ROOM_HEIGHT - WALL_THICKNESS; y += plankHeight) {
      ctx.beginPath();
      ctx.moveTo(WALL_THICKNESS, y);
      ctx.lineTo(ROOM_WIDTH - WALL_THICKNESS, y);
      ctx.stroke();

      const offset = (Math.floor(y / plankHeight) % 2) * (plankWidth / 2);
      for (let x = WALL_THICKNESS + offset; x < ROOM_WIDTH - WALL_THICKNESS; x += plankWidth) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + plankHeight);
        ctx.stroke();
      }
    }
  } else if (pattern === 'tiles') {
    // Large ceramic tiles
    ctx.strokeStyle = secondaryColor;
    ctx.lineWidth = 1.5;
    const tileSize = 48;
    for (let x = WALL_THICKNESS; x < ROOM_WIDTH - WALL_THICKNESS; x += tileSize) {
      for (let y = WALL_THICKNESS; y < ROOM_HEIGHT - WALL_THICKNESS; y += tileSize) {
        ctx.strokeRect(x, y, tileSize, tileSize);
      }
    }
  } else if (pattern === 'carpet') {
    // Subtle woven carpet texture
    ctx.fillStyle = secondaryColor;
    const step = 8;
    for (let x = WALL_THICKNESS; x < ROOM_WIDTH - WALL_THICKNESS; x += step * 2) {
      for (let y = WALL_THICKNESS; y < ROOM_HEIGHT - WALL_THICKNESS; y += step * 2) {
        ctx.fillRect(x, y, step, step);
      }
    }
  } else if (pattern === 'checkered') {
    // Classroom linoleum
    ctx.fillStyle = secondaryColor;
    const size = 32;
    for (let x = WALL_THICKNESS; x < ROOM_WIDTH - WALL_THICKNESS; x += size) {
      for (let y = WALL_THICKNESS; y < ROOM_HEIGHT - WALL_THICKNESS; y += size) {
        if ((Math.floor(x / size) + Math.floor(y / size)) % 2 === 0) {
          ctx.fillRect(x, y, size, size);
        }
      }
    }
  }

  // Soft room center rug
  if (level.roomType === 'bedroom') {
    ctx.fillStyle = 'rgba(190, 24, 93, 0.25)'; // Rose rug
    roundRect(ctx, 280, 200, 240, 160, 20);
    ctx.fill();
    ctx.strokeStyle = 'rgba(244, 114, 182, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();
  } else if (level.roomType === 'livingroom') {
    ctx.fillStyle = 'rgba(51, 65, 85, 0.35)'; // Slate rug
    roundRect(ctx, 300, 180, 200, 160, 16);
    ctx.fill();
  }
}

function drawWalls(ctx: CanvasRenderingContext2D, level: LevelData) {
  const { wallColor, wallTrimColor } = level.floorTheme;

  // Wall fills
  ctx.fillStyle = wallColor;

  // Top wall (except doorway)
  ctx.fillRect(0, 0, level.door.x, WALL_THICKNESS);
  ctx.fillRect(
    level.door.x + level.door.width,
    0,
    ROOM_WIDTH - (level.door.x + level.door.width),
    WALL_THICKNESS
  );

  // Bottom wall
  ctx.fillRect(0, ROOM_HEIGHT - WALL_THICKNESS, ROOM_WIDTH, WALL_THICKNESS);

  // Left wall
  ctx.fillRect(0, 0, WALL_THICKNESS, ROOM_HEIGHT);

  // Right wall
  ctx.fillRect(ROOM_WIDTH - WALL_THICKNESS, 0, WALL_THICKNESS, ROOM_HEIGHT);

  // Inner border trim
  ctx.strokeStyle = wallTrimColor;
  ctx.lineWidth = 3;
  ctx.strokeRect(
    WALL_THICKNESS,
    WALL_THICKNESS,
    ROOM_WIDTH - WALL_THICKNESS * 2,
    ROOM_HEIGHT - WALL_THICKNESS * 2
  );

  // Top Wall 3D drop shadow into the room
  const shadowGrad = ctx.createLinearGradient(0, WALL_THICKNESS, 0, WALL_THICKNESS + 16);
  shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
  shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = shadowGrad;
  ctx.fillRect(WALL_THICKNESS, WALL_THICKNESS, ROOM_WIDTH - WALL_THICKNESS * 2, 16);
}

function drawDoor(ctx: CanvasRenderingContext2D, level: LevelData, tick: number) {
  const { door } = level;
  const allSolved = level.puzzles.every((p) => p.solved);

  // Door recess
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(door.x, door.y, door.width, door.height);

  // Door slab
  if (!door.isOpen) {
    ctx.fillStyle = allSolved ? '#15803d' : '#854d0e'; // Green if unlocked/ready, dark wood if locked
    ctx.fillRect(door.x + 3, door.y + 3, door.width - 6, door.height - 6);

    // Lock panel
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(door.x + door.width / 2 - 10, door.y + 12, 20, 14);

    // Glowing LED on lock
    const pulse = Math.sin(tick * 0.1) * 0.3 + 0.7;
    ctx.fillStyle = allSolved
      ? `rgba(34, 197, 94, ${pulse})` // Green pulse
      : `rgba(239, 68, 68, ${pulse})`; // Red pulse
    ctx.beginPath();
    ctx.arc(door.x + door.width / 2, door.y + 19, 4, 0, Math.PI * 2);
    ctx.fill();

    // Keyhole or handle
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(door.x + door.width / 2 - 1, door.y + 20, 2, 4);
  } else {
    // Open doorway light ray
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(door.x + 4, door.y + 4, door.width - 8, door.height - 8);
  }

  // EXIT Sign above door
  ctx.fillStyle = allSolved ? '#22c55e' : '#ef4444';
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('EXIT / KELUAR', door.x + door.width / 2, door.y + 8);
}

function drawPuzzleStation(
  ctx: CanvasRenderingContext2D,
  puzzle: Puzzle,
  tick: number,
  roomType: string
) {
  const { x, y, width, height, id, solved, icon } = puzzle;

  // Drop shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  roundRect(ctx, x + 4, y + 4, width, height, 6);
  ctx.fill();

  // Custom furniture graphics based on icon & room
  if (icon === 'bed') {
    // Wooden bed frame
    ctx.fillStyle = '#78350f';
    roundRect(ctx, x, y, width, height, 8);
    ctx.fill();

    // Bed sheet / duvet
    ctx.fillStyle = '#38bdf8';
    roundRect(ctx, x + 6, y + 36, width - 12, height - 42, 4);
    ctx.fill();

    // Pillows
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, x + 10, y + 8, width / 2 - 14, 24, 4);
    roundRect(ctx, x + width / 2 + 4, y + 8, width / 2 - 14, 24, 4);
    ctx.fill();
  } else if (icon === 'desk' || icon === 'teacher_desk') {
    // Desk surface
    ctx.fillStyle = icon === 'teacher_desk' ? '#854d0e' : '#a16207';
    roundRect(ctx, x, y, width, height, 6);
    ctx.fill();
    ctx.strokeStyle = '#713f12';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Laptop or open books
    ctx.fillStyle = '#334155';
    ctx.fillRect(x + width / 2 - 16, y + 14, 32, 22);
    ctx.fillStyle = '#38bdf8'; // Glowing screen
    ctx.fillRect(x + width / 2 - 14, y + 16, 28, 14);

    // Lamp
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(x + 16, y + 16, 6, 0, Math.PI * 2);
    ctx.fill();
  } else if (icon === 'tv') {
    // TV Stand
    ctx.fillStyle = '#1e293b';
    roundRect(ctx, x, y, width, height, 6);
    ctx.fill();

    // TV Screen
    ctx.fillStyle = '#090d16';
    roundRect(ctx, x + 10, y + 10, width - 20, height - 20, 4);
    ctx.fill();
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Power LED
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(x + width / 2 - 2, y + height - 14, 4, 3);
  } else if (icon === 'couch') {
    // Big sofa
    ctx.fillStyle = '#b45309';
    roundRect(ctx, x, y, width, height, 12);
    ctx.fill();

    // Cushions
    ctx.fillStyle = '#d97706';
    const cushionCount = 3;
    const ch = (height - 16) / cushionCount;
    for (let i = 0; i < cushionCount; i++) {
      roundRect(ctx, x + 8, y + 8 + i * ch, width - 16, ch - 4, 4);
      ctx.fill();
    }
  } else if (icon === 'blackboard' || icon === 'whiteboard') {
    // Board
    ctx.fillStyle = icon === 'blackboard' ? '#064e3b' : '#f8fafc';
    roundRect(ctx, x, y, width, height, 4);
    ctx.fill();
    ctx.strokeStyle = '#78350f'; // Wood frame
    ctx.lineWidth = 4;
    ctx.stroke();

    // Chalk writings
    ctx.fillStyle = icon === 'blackboard' ? '#a7f3d0' : '#2563eb';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('f(x) = ?', x + width / 2, y + height / 2 + 3);
  } else if (icon === 'bookshelf') {
    // Bookshelf
    ctx.fillStyle = '#5c2b09';
    roundRect(ctx, x, y, width, height, 6);
    ctx.fill();

    // Colorful books along shelves
    const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    const shelfCount = Math.floor(height / 24);
    for (let s = 0; s < shelfCount; s++) {
      const sy = y + 6 + s * 24;
      let bx = x + 6;
      let cIdx = s;
      while (bx < x + width - 12) {
        const bw = 5 + (bx % 4);
        ctx.fillStyle = colors[cIdx % colors.length];
        ctx.fillRect(bx, sy, bw, 16);
        bx += bw + 2;
        cIdx++;
      }
    }
  } else {
    // Default refined furniture block
    ctx.fillStyle = '#64748b';
    roundRect(ctx, x, y, width, height, 6);
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Floating Question Badge on the furniture
  const bounce = Math.sin(tick * 0.08 + id) * 3;
  const badgeX = x + width / 2;
  const badgeY = y + height / 2 + bounce;

  // Pulsing glow ring
  ctx.save();
  ctx.beginPath();
  ctx.arc(badgeX, badgeY, 14, 0, Math.PI * 2);
  ctx.fillStyle = solved
    ? 'rgba(16, 185, 129, 0.25)'
    : 'rgba(245, 158, 11, 0.3)';
  ctx.fill();

  // Badge background
  ctx.beginPath();
  ctx.arc(badgeX, badgeY, 11, 0, Math.PI * 2);
  ctx.fillStyle = solved ? '#10b981' : '#f59e0b';
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Text inside badge
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(solved ? '✓' : String(id), badgeX, badgeY);
  ctx.restore();
}

function drawObstacle(
  ctx: CanvasRenderingContext2D,
  obs: { x: number; y: number; width: number; height: number; type: string; label?: string },
  roomType: string
) {
  const { x, y, width, height, type } = obs;

  // Drop shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  roundRect(ctx, x + 3, y + 3, width, height, 6);
  ctx.fill();

  if (type === 'plant') {
    // Plant pot
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.arc(x + width / 2, y + height / 2, width / 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Leaves
    ctx.fillStyle = '#16a34a';
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5;
      const lx = x + width / 2 + Math.cos(angle) * (width / 2.8);
      const ly = y + height / 2 + Math.sin(angle) * (height / 2.8);
      ctx.beginPath();
      ctx.arc(lx, ly, width / 5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'meeting_table') {
    // Office oval table
    ctx.fillStyle = '#475569';
    roundRect(ctx, x, y, width, height, 20);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.stroke();
  } else if (type === 'student_desk') {
    // Classroom desk & chair
    ctx.fillStyle = '#d97706';
    roundRect(ctx, x, y, width, height - 15, 4);
    ctx.fill();
    // Chair
    ctx.fillStyle = '#475569';
    roundRect(ctx, x + 10, y + height - 12, width - 20, 10, 3);
    ctx.fill();
  } else {
    // Standard furniture
    ctx.fillStyle = '#475569';
    roundRect(ctx, x, y, width, height, 6);
    ctx.fill();
  }
}

function drawPlayer(ctx: CanvasRenderingContext2D, player: Player, tick: number) {
  const { x, y, width, height, facing, isMoving, walkFrame } = player;
  const cx = x + width / 2;
  const cy = y + height / 2;

  // 1. Soft character shadow
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 12, 11, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Walking leg animation (shoes)
  const legOffset = isMoving ? Math.sin(walkFrame) * 4 : 0;
  ctx.fillStyle = '#0f172a'; // Dark shoes
  if (facing === 'down' || facing === 'up') {
    ctx.fillRect(cx - 7, cy + 7 + legOffset, 5, 6);
    ctx.fillRect(cx + 2, cy + 7 - legOffset, 5, 6);
  } else {
    ctx.fillRect(cx - 4 + legOffset, cy + 7, 8, 6);
  }

  // 3. Body / Shirt (bright explorer teal/amber jacket)
  ctx.fillStyle = '#0284c7'; // Explorer Jacket
  roundRect(ctx, cx - 9, cy - 4, 18, 15, 4);
  ctx.fill();

  // 4. Backpack
  ctx.fillStyle = '#d97706';
  if (facing === 'down') {
    // Backpack behind shoulders
    roundRect(ctx, cx - 11, cy - 3, 4, 10, 2);
    ctx.fill();
    roundRect(ctx, cx + 7, cy - 3, 4, 10, 2);
    ctx.fill();
  } else if (facing === 'up') {
    // Prominent backpack on back
    roundRect(ctx, cx - 8, cy - 3, 16, 11, 3);
    ctx.fill();
  } else if (facing === 'left') {
    roundRect(ctx, cx + 2, cy - 3, 6, 12, 2);
    ctx.fill();
  } else if (facing === 'right') {
    roundRect(ctx, cx - 8, cy - 3, 6, 12, 2);
    ctx.fill();
  }

  // 5. Head / Face
  ctx.fillStyle = '#fed7aa'; // Skin
  ctx.beginPath();
  ctx.arc(cx, cy - 6, 9, 0, Math.PI * 2);
  ctx.fill();

  // 6. Hair / Explorer Cap
  ctx.fillStyle = '#e11d48'; // Red cap
  ctx.beginPath();
  ctx.arc(cx, cy - 8, 9, Math.PI, Math.PI * 2);
  ctx.fill();
  // Cap visor depending on facing
  if (facing === 'down') {
    ctx.fillRect(cx - 7, cy - 8, 14, 3);
  } else if (facing === 'left') {
    ctx.fillRect(cx - 10, cy - 8, 6, 3);
  } else if (facing === 'right') {
    ctx.fillRect(cx + 4, cy - 8, 6, 3);
  }

  // 7. Eyes (if facing down, left, right)
  ctx.fillStyle = '#0f172a';
  if (facing === 'down') {
    ctx.fillRect(cx - 4, cy - 6, 2, 2);
    ctx.fillRect(cx + 2, cy - 6, 2, 2);
  } else if (facing === 'left') {
    ctx.fillRect(cx - 6, cy - 6, 2, 2);
  } else if (facing === 'right') {
    ctx.fillRect(cx + 4, cy - 6, 2, 2);
  }

  ctx.restore();
}

function drawInteractBubble(
  ctx: CanvasRenderingContext2D,
  nearby: { type: 'puzzle'; puzzle?: Puzzle } | { type: 'door' },
  tick: number
) {
  let targetX = 0;
  let targetY = 0;
  let label = '';
  let isReady = true;
  let showBelow = false;

  if (nearby.type === 'puzzle' && nearby.puzzle) {
    targetX = nearby.puzzle.x + nearby.puzzle.width / 2;
    // If puzzle is placed close to the top wall, position bubble beneath it
    if (nearby.puzzle.y < 110) {
      showBelow = true;
      targetY = nearby.puzzle.y + nearby.puzzle.height + 10;
    } else {
      showBelow = false;
      targetY = nearby.puzzle.y - 12;
    }
    label = nearby.puzzle.solved
      ? `Soal #${nearby.puzzle.id} (Selesai)`
      : `Tekan [E] Soal #${nearby.puzzle.id}`;
    isReady = !nearby.puzzle.solved;
  } else if (nearby.type === 'door') {
    targetX = ROOM_WIDTH / 2;
    targetY = WALL_THICKNESS + 40;
    showBelow = true;
    label = 'Tekan [E] Pintu';
  }

  const bounce = Math.sin(tick * 0.1) * 3;

  ctx.save();
  ctx.font = 'bold 11px sans-serif';
  const textWidth = ctx.measureText(label).width;
  const paddingX = 10;
  const bubbleW = textWidth + paddingX * 2;
  const bubbleH = 22;
  const bubbleX = targetX - bubbleW / 2;
  const bubbleY = showBelow ? targetY + bounce : targetY - bubbleH + bounce;

  // Speech bubble background
  ctx.fillStyle = isReady ? '#f59e0b' : '#334155';
  roundRect(ctx, bubbleX, bubbleY, bubbleW, bubbleH, 6);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Pointer triangle
  ctx.beginPath();
  if (showBelow) {
    ctx.moveTo(targetX - 4, bubbleY);
    ctx.lineTo(targetX, bubbleY - 4);
    ctx.lineTo(targetX + 4, bubbleY);
  } else {
    ctx.moveTo(targetX - 4, bubbleY + bubbleH);
    ctx.lineTo(targetX, bubbleY + bubbleH + 4);
    ctx.lineTo(targetX + 4, bubbleY + bubbleH);
  }
  ctx.fillStyle = isReady ? '#f59e0b' : '#334155';
  ctx.fill();

  // Text
  ctx.fillStyle = isReady ? '#0f172a' : '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, targetX, bubbleY + bubbleH / 2);
  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) {
  const r = Math.min(radius, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
