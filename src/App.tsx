/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, LevelData, Puzzle, GameProgress } from './types';
import { LEVELS } from './data/levels';
import { loadProgress, markLevelCompleted, resetProgress } from './utils/storage';
import { sounds } from './utils/audio';

import { HintBar } from './components/HintBar';
import { GameCanvas } from './components/GameCanvas';
import { QuestionModal } from './components/QuestionModal';
import { DoorCodeModal } from './components/DoorCodeModal';
import { VirtualDPad } from './components/VirtualDPad';
import { MainMenu } from './components/MainMenu';
import { LevelSelect } from './components/LevelSelect';
import { HowToPlay } from './components/HowToPlay';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { GameCompleteModal } from './components/GameCompleteModal';
import { AlertCircle } from 'lucide-react';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('MAIN_MENU');
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [currentLevel, setCurrentLevel] = useState<LevelData>(() =>
    JSON.parse(JSON.stringify(LEVELS[0]))
  );
  const [activePuzzle, setActivePuzzle] = useState<Puzzle | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [progress, setProgress] = useState<GameProgress>(() => loadProgress());
  const [isMuted, setIsMuted] = useState<boolean>(() => sounds.getIsMuted());

  // Door locked notification toast
  const [lockedDoorNotice, setLockedDoorNotice] = useState<string | null>(null);
  const noticeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Virtual controls
  const [virtualDirection, setVirtualDirection] = useState<{ x: number; y: number } | null>(null);
  const [virtualInteractTrigger, setVirtualInteractTrigger] = useState<number>(0);

  // New record flag for Level Complete screen
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);

  // Level Timer Effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (
      gameState === 'PLAYING' ||
      gameState === 'QUESTION_MODAL' ||
      gameState === 'DOOR_CODE'
    ) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  // Load level helper
  const startLevel = useCallback((levelId: number) => {
    const rawTemplate = LEVELS.find((l) => l.id === levelId) || LEVELS[0];
    // Deep clone so puzzles can be solved cleanly per session
    const cloned: LevelData = JSON.parse(JSON.stringify(rawTemplate));
    setCurrentLevelId(levelId);
    setCurrentLevel(cloned);
    setElapsedSeconds(0);
    setActivePuzzle(null);
    setLockedDoorNotice(null);
    setGameState('PLAYING');
  }, []);

  // Puzzle interaction handler
  const handleInteractPuzzle = (puzzle: Puzzle) => {
    setActivePuzzle(puzzle);
    setGameState('QUESTION_MODAL');
  };

  // Solve puzzle callback
  const handleSolvePuzzle = (puzzleId: number) => {
    setCurrentLevel((prev) => {
      const updatedPuzzles = prev.puzzles.map((p) =>
        p.id === puzzleId ? { ...p, solved: true } : p
      );
      return {
        ...prev,
        puzzles: updatedPuzzles,
      };
    });
  };

  // Close question modal
  const handleCloseQuestionModal = () => {
    setActivePuzzle(null);
    setGameState('PLAYING');
  };

  // Door interaction (when all 5 puzzles solved)
  const handleInteractDoor = () => {
    setGameState('DOOR_CODE');
  };

  // Door locked notice
  const handleDoorLockedNotice = () => {
    const solvedCount = currentLevel.puzzles.filter((p) => p.solved).length;
    setLockedDoorNotice(
      `Pintu terkunci! Kamu baru menyelesaikan ${solvedCount}/5 soal. Selesaikan semua soal untuk mengumpulkan hint!`
    );

    if (noticeTimeoutRef.current) {
      clearTimeout(noticeTimeoutRef.current);
    }
    noticeTimeoutRef.current = setTimeout(() => {
      setLockedDoorNotice(null);
    }, 3500);
  };

  // Door successfully unlocked
  const handleDoorUnlockSuccess = () => {
    // Check if new best time
    const prevBest = progress.bestTimes[currentLevelId];
    const isBest = !prevBest || elapsedSeconds < prevBest;
    setIsNewRecord(isBest);

    // Mark completed in storage
    const updated = markLevelCompleted(currentLevelId, elapsedSeconds);
    setProgress(updated);

    // Transition to Level Complete
    setGameState('LEVEL_COMPLETE');
  };

  // Next level handler from modal
  const handleNextLevel = () => {
    if (currentLevelId < 5) {
      startLevel(currentLevelId + 1);
    } else {
      setGameState('GAME_COMPLETE');
    }
  };

  // Reset all progress
  const handleResetProgress = () => {
    const fresh = resetProgress();
    setProgress(fresh);
  };

  // Mute toggle
  const handleToggleMute = () => {
    const next = sounds.toggleMute();
    setIsMuted(next);
  };

  return (
    <div className="relative w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start overflow-x-hidden font-sans">
      {/* 1. MAIN MENU */}
      {gameState === 'MAIN_MENU' && (
        <MainMenu
          progress={progress}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onStartGame={startLevel}
          onOpenLevelSelect={() => setGameState('LEVEL_SELECT')}
          onOpenHowToPlay={() => setGameState('HOW_TO_PLAY')}
        />
      )}

      {/* 2. LEVEL SELECTION */}
      {gameState === 'LEVEL_SELECT' && (
        <LevelSelect
          progress={progress}
          onSelectLevel={startLevel}
          onBackToMenu={() => setGameState('MAIN_MENU')}
          onResetProgress={handleResetProgress}
        />
      )}

      {/* 3. HOW TO PLAY */}
      {gameState === 'HOW_TO_PLAY' && (
        <HowToPlay onBack={() => setGameState('MAIN_MENU')} />
      )}

      {/* 4. ACTIVE GAMEPLAY SCREENS */}
      {(gameState === 'PLAYING' ||
        gameState === 'QUESTION_MODAL' ||
        gameState === 'DOOR_CODE' ||
        gameState === 'LEVEL_COMPLETE' ||
        gameState === 'GAME_COMPLETE') && (
        <div className="w-full flex flex-col items-center pb-6">
          {/* Top Hint Bar */}
          <HintBar
            levelId={currentLevel.id}
            levelName={currentLevel.name}
            roomTitle={currentLevel.roomTitle}
            puzzles={currentLevel.puzzles}
            elapsedSeconds={elapsedSeconds}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onOpenHowToPlay={() => setGameState('HOW_TO_PLAY')}
            onExitToMenu={() => setGameState('MAIN_MENU')}
          />

          {/* Door Locked Floating Banner */}
          {lockedDoorNotice && (
            <div className="fixed top-18 z-40 px-4 py-2.5 max-w-md bg-rose-900/90 border border-rose-500 text-rose-100 text-xs sm:text-sm font-semibold rounded-xl shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-200">
              <AlertCircle className="w-5 h-5 text-rose-300 shrink-0" />
              <span>{lockedDoorNotice}</span>
            </div>
          )}

          {/* 2D Top-Down Game Canvas */}
          <main className="w-full max-w-4xl px-3 pt-3 flex flex-col items-center">
            <GameCanvas
              level={currentLevel}
              onInteractPuzzle={handleInteractPuzzle}
              onInteractDoor={handleInteractDoor}
              onDoorLockedNotice={handleDoorLockedNotice}
              virtualDirection={virtualDirection}
              virtualInteractTrigger={virtualInteractTrigger}
            />

            {/* Virtual Controls for Mobile / Tablets */}
            <VirtualDPad
              onDirectionChange={setVirtualDirection}
              onInteract={() => setVirtualInteractTrigger((prev) => prev + 1)}
            />
          </main>
        </div>
      )}

      {/* MODALS */}

      {/* Question Modal */}
      {gameState === 'QUESTION_MODAL' && activePuzzle && (
        <QuestionModal
          puzzle={activePuzzle}
          onClose={handleCloseQuestionModal}
          onSolve={handleSolvePuzzle}
        />
      )}

      {/* Door Code Modal */}
      {gameState === 'DOOR_CODE' && (
        <DoorCodeModal
          puzzles={currentLevel.puzzles}
          onClose={() => setGameState('PLAYING')}
          onSuccess={handleDoorUnlockSuccess}
        />
      )}

      {/* Level Complete Modal */}
      {gameState === 'LEVEL_COMPLETE' && (
        <LevelCompleteModal
          level={currentLevel}
          timeSpentSeconds={elapsedSeconds}
          isNewBest={isNewRecord}
          onNextLevel={handleNextLevel}
          onLevelSelect={() => setGameState('LEVEL_SELECT')}
          onMainMenu={() => setGameState('MAIN_MENU')}
        />
      )}

      {/* Game Complete Modal (All 5 levels conquered) */}
      {gameState === 'GAME_COMPLETE' && (
        <GameCompleteModal
          progress={progress}
          onPlayAgain={() => startLevel(1)}
          onLevelSelect={() => setGameState('LEVEL_SELECT')}
          onMainMenu={() => setGameState('MAIN_MENU')}
        />
      )}
    </div>
  );
}
