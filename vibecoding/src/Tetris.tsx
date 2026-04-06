import { useMemo } from 'react';
import { useTetris } from './useTetris';
import './Tetris.css';

const CELL_SIZE = 30;
const BOARD_WIDTH = 10;

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  angle: number;
  speed: number;
}

function Particles({ clearingRows, board }: { clearingRows: number[]; board: (string | null)[][] }) {
  const particles = useMemo<Particle[]>(() => {
    if (clearingRows.length === 0) return [];
    const result: Particle[] = [];
    let id = 0;
    clearingRows.forEach(row => {
      for (let col = 0; col < BOARD_WIDTH; col++) {
        const color = board[row][col] ?? '#fff';
        const cx = col * CELL_SIZE + CELL_SIZE / 2;
        const cy = row * CELL_SIZE + CELL_SIZE / 2;
        for (let i = 0; i < 6; i++) {
          result.push({
            id: id++,
            x: cx,
            y: cy,
            color,
            angle: (360 / 6) * i + Math.random() * 30,
            speed: 40 + Math.random() * 60,
          });
        }
      }
    });
    return result;
  }, [clearingRows]);

  if (particles.length === 0) return null;

  return (
    <svg
      className="particles-layer"
      style={{ width: BOARD_WIDTH * CELL_SIZE, height: 20 * CELL_SIZE }}
    >
      {particles.map(p => {
        const rad = (p.angle * Math.PI) / 180;
        const tx = Math.cos(rad) * p.speed;
        const ty = Math.sin(rad) * p.speed;
        return (
          <circle
            key={p.id}
            cx={p.x}
            cy={p.y}
            r={4}
            fill={p.color}
            className="particle"
            style={
              {
                '--tx': `${tx}px`,
                '--ty': `${ty}px`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </svg>
  );
}

function MiniBoard({ shape, color }: { shape: number[][]; color: string }) {
  const rows = 2;
  const cols = 4;
  const grid = Array.from({ length: rows }, () => Array(cols).fill(null));
  shape.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (cell && r < rows && c < cols) grid[r][c] = color;
    });
  });
  return (
    <div className="mini-board">
      {grid.map((row, r) =>
        row.map((cell, c) => (
          <div
            key={`${r}-${c}`}
            className="mini-cell"
            style={{ background: cell ?? 'transparent' }}
          />
        ))
      )}
    </div>
  );
}

export default function Tetris() {
  const { board, next, score, lines, gameOver, paused, clearingRows, reset, setPaused } = useTetris();

  return (
    <div className="tetris-wrapper">
      <div className="tetris-container">
        <div
          className="tetris-board"
          style={{ width: 10 * CELL_SIZE, height: 20 * CELL_SIZE }}
        >
          {board.map((row, r) =>
            row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                className={[
                  'cell',
                  cell === 'ghost' ? 'ghost' : cell ? 'filled' : '',
                  clearingRows.includes(r) ? 'clearing' : '',
                ].join(' ')}
                style={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  background: cell === 'ghost' ? 'transparent' : (cell ?? 'transparent'),
                  border: cell === 'ghost' ? '1px dashed rgba(255,255,255,0.25)' : undefined,
                }}
              />
            ))
          )}

          <Particles clearingRows={clearingRows} board={board} />

          {(gameOver || paused) && (
            <div className="overlay">
              <p>{gameOver ? 'GAME OVER' : 'PAUSED'}</p>
              <button onClick={gameOver ? reset : () => setPaused(false)}>
                {gameOver ? 'Play Again' : 'Resume'}
              </button>
            </div>
          )}
        </div>

        <div className="side-panel">
          <div className="panel-block">
            <div className="label">NEXT</div>
            <MiniBoard shape={next.shape} color={next.color} />
          </div>
          <div className="panel-block">
            <div className="label">SCORE</div>
            <div className="value">{score}</div>
          </div>
          <div className="panel-block">
            <div className="label">LINES</div>
            <div className="value">{lines}</div>
          </div>
          <div className="panel-block controls">
            <button onClick={reset}>Restart (R)</button>
            <button onClick={() => setPaused(p => !p)}>
              {paused ? 'Resume (P)' : 'Pause (P)'}
            </button>
          </div>
          <div className="panel-block keys">
            <div className="label">CONTROLS</div>
            <div>← → Move</div>
            <div>↑ Rotate</div>
            <div>↓ Soft drop</div>
            <div>Space Hard drop</div>
          </div>
        </div>
      </div>
    </div>
  );
}
