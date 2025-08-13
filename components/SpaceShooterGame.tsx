import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Volume2, VolumeX } from 'lucide-react';
import { useAudioManager } from './AudioManager';

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

export function SpaceShooterGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const audioManager = useAudioManager();
  
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameOver'>('menu');
  const [score, setScore] = useState(0);
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('spaceShooterMuted') === 'true';
    }
    return false;
  });
  const [highScore, setHighScore] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem('spaceShooterHighScore') || '0');
    }
    return 0;
  });

  const gameStateRef = useRef({
    player: { x: 400, y: 500, width: 40, height: 40, vx: 0, vy: 0 },
    bullets: [] as GameObject[],
    enemies: [] as GameObject[],
    particles: [] as Particle[],
    keys: {} as Record<string, boolean>,
    lastEnemySpawn: 0,
    enemySpawnRate: 1000,
  });

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;

  const createParticles = useCallback((x: number, y: number, color: string, count: number = 8) => {
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 30,
        maxLife: 30,
        color,
      });
    }
    gameStateRef.current.particles.push(...particles);
  }, []);

  const checkCollision = useCallback((obj1: GameObject, obj2: GameObject) => {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
  }, []);

  const updateGame = useCallback(() => {
    const gameState = gameStateRef.current;
    const now = Date.now();

    // Update player
    if (gameState.keys['ArrowLeft'] || gameState.keys['a'] || gameState.keys['A']) {
      gameState.player.x = Math.max(0, gameState.player.x - 8);
    }
    if (gameState.keys['ArrowRight'] || gameState.keys['d'] || gameState.keys['D']) {
      gameState.player.x = Math.min(CANVAS_WIDTH - gameState.player.width, gameState.player.x + 8);
    }
    if (gameState.keys['ArrowUp'] || gameState.keys['w'] || gameState.keys['W']) {
      gameState.player.y = Math.max(0, gameState.player.y - 8);
    }
    if (gameState.keys['ArrowDown'] || gameState.keys['s'] || gameState.keys['S']) {
      gameState.player.y = Math.min(CANVAS_HEIGHT - gameState.player.height, gameState.player.y + 8);
    }

    // Spawn bullets
    if (gameState.keys[' '] || gameState.keys['Space']) {
      if (gameState.bullets.length === 0 || gameState.bullets[gameState.bullets.length - 1].y < gameState.player.y - 50) {
        gameState.bullets.push({
          x: gameState.player.x + gameState.player.width / 2 - 2,
          y: gameState.player.y,
          width: 4,
          height: 10,
          vx: 0,
          vy: -12,
        });
        audioManager.playShoot(); // Play shoot sound
      }
    }

    // Update bullets
    gameState.bullets = gameState.bullets.filter(bullet => {
      bullet.y += bullet.vy;
      return bullet.y > -bullet.height;
    });

    // Spawn enemies
    if (now - gameState.lastEnemySpawn > gameState.enemySpawnRate) {
      gameState.enemies.push({
        x: Math.random() * (CANVAS_WIDTH - 30),
        y: -30,
        width: 30,
        height: 30,
        vx: 0,
        vy: 2 + Math.random() * 3,
      });
      gameState.lastEnemySpawn = now;
      gameState.enemySpawnRate = Math.max(300, gameState.enemySpawnRate - 5);
    }

    // Update enemies
    gameState.enemies = gameState.enemies.filter(enemy => {
      enemy.y += enemy.vy;
      return enemy.y < CANVAS_HEIGHT + enemy.height;
    });

    // Check bullet-enemy collisions
    for (let i = gameState.bullets.length - 1; i >= 0; i--) {
      for (let j = gameState.enemies.length - 1; j >= 0; j--) {
        if (checkCollision(gameState.bullets[i], gameState.enemies[j])) {
          createParticles(
            gameState.enemies[j].x + gameState.enemies[j].width / 2,
            gameState.enemies[j].y + gameState.enemies[j].height / 2,
            '#ff6b6b',
            12
          );
          audioManager.playExplosion(); // Play explosion sound
          gameState.bullets.splice(i, 1);
          gameState.enemies.splice(j, 1);
          setScore(prev => prev + 10);
          break;
        }
      }
    }

    // Check player-enemy collisions
    for (const enemy of gameState.enemies) {
      if (checkCollision(gameState.player, enemy)) {
        audioManager.playGameOver(); // Play game over sound
        audioManager.stopBackgroundMusic(); // Stop background music
        setGameState('gameOver');
        return;
      }
    }

    // Update particles
    gameState.particles = gameState.particles.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vx *= 0.98;
      particle.vy *= 0.98;
      particle.life--;
      return particle.life > 0;
    });
  }, [checkCollision, createParticles]);

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameState = gameStateRef.current;

    // Clear canvas with gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#0f0f23');
    gradient.addColorStop(1, '#1a1a3a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw stars
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 100; i++) {
      const x = (i * 67) % CANVAS_WIDTH;
      const y = (i * 31) % CANVAS_HEIGHT;
      ctx.fillRect(x, y, 1, 1);
    }

    // Draw player
    ctx.fillStyle = '#4ecdc4';
    ctx.fillRect(gameState.player.x, gameState.player.y, gameState.player.width, gameState.player.height);
    
    // Draw player glow
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#4ecdc4';
    ctx.fillStyle = '#4ecdc4';
    ctx.fillRect(gameState.player.x + 5, gameState.player.y + 5, gameState.player.width - 10, gameState.player.height - 10);
    ctx.shadowBlur = 0;

    // Draw bullets
    ctx.fillStyle = '#ffe66d';
    gameState.bullets.forEach(bullet => {
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });

    // Draw enemies
    ctx.fillStyle = '#ff6b6b';
    gameState.enemies.forEach(enemy => {
      ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
      
      // Enemy glow
      ctx.shadowBlur = 5;
      ctx.shadowColor = '#ff6b6b';
      ctx.fillStyle = '#ff6b6b';
      ctx.fillRect(enemy.x + 2, enemy.y + 2, enemy.width - 4, enemy.height - 4);
      ctx.shadowBlur = 0;
    });

    // Draw particles
    gameState.particles.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      ctx.fillStyle = particle.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
      ctx.fillRect(particle.x, particle.y, 3, 3);
    });
  }, []);

  const gameLoop = useCallback(() => {
    if (gameState === 'playing') {
      updateGame();
      drawGame();
      animationRef.current = requestAnimationFrame(gameLoop);
    }
  }, [gameState, updateGame, drawGame]);

  const startGame = useCallback(() => {
    audioManager.playGameStart(); // Play game start sound
    audioManager.startBackgroundMusic(); // Start background music
    setGameState('playing');
    setScore(0);
    gameStateRef.current = {
      player: { x: 400, y: 500, width: 40, height: 40, vx: 0, vy: 0 },
      bullets: [],
      enemies: [],
      particles: [],
      keys: {},
      lastEnemySpawn: 0,
      enemySpawnRate: 1000,
    };
  }, [audioManager]);

  const toggleMute = useCallback(() => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    audioManager.setMuted(newMuted);
    
    if (newMuted) {
      audioManager.stopBackgroundMusic();
    } else if (gameState === 'playing') {
      audioManager.startBackgroundMusic();
    }
  }, [isMuted, audioManager, gameState]);

  // Initialize audio manager muted state
  useEffect(() => {
    audioManager.setMuted(isMuted);
  }, [audioManager, isMuted]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    gameStateRef.current.keys[e.key] = true;
    if (e.key === ' ') {
      e.preventDefault();
    }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    gameStateRef.current.keys[e.key] = false;
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [handleKeyDown, handleKeyUp]);

  useEffect(() => {
    if (gameState === 'playing') {
      gameLoop();
    }
  }, [gameState, gameLoop]);

  useEffect(() => {
    if (gameState === 'gameOver' && score > highScore) {
      setHighScore(score);
      localStorage.setItem('spaceShooterHighScore', score.toString());
    }
  }, [gameState, score, highScore]);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="flex items-center justify-between w-full max-w-2xl">
        <div className="flex items-center gap-8">
          <div className="text-center">
            <p className="text-muted-foreground">Score</p>
            <p className="text-2xl font-mono">{score}</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">High Score</p>
            <p className="text-2xl font-mono">{highScore}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMute}
          className="hover:bg-accent"
          title={isMuted ? "Unmute audio" : "Mute audio"}
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5" />
          ) : (
            <Volume2 className="h-5 w-5" />
          )}
        </Button>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border border-border rounded-lg bg-black"
        />

        {gameState === 'menu' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-lg">
            <Card className="p-6 text-center">
              <h2 className="mb-4">Space Shooter</h2>
              <p className="mb-4 text-muted-foreground">
                Use WASD or Arrow Keys to move<br/>
                Space to shoot
              </p>
              <Button onClick={startGame}>Start Game</Button>
            </Card>
          </div>
        )}

        {gameState === 'gameOver' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-lg">
            <Card className="p-6 text-center">
              <h2 className="mb-4">Game Over</h2>
              <p className="mb-2">Final Score: <span className="font-mono">{score}</span></p>
              {score === highScore && (
                <p className="mb-4 text-yellow-500">New High Score! 🎉</p>
              )}
              <div className="flex gap-2">
                <Button onClick={startGame}>Play Again</Button>
                <Button variant="secondary" onClick={() => setGameState('menu')}>Menu</Button>
              </div>
            </Card>
          </div>
        )}
      </div>

      <div className="text-center text-sm text-muted-foreground max-w-md">
        <p>Destroy enemies to earn points! Avoid letting them touch your ship.</p>
        <p>The game gets faster as your score increases.</p>
      </div>
    </div>
  );
}