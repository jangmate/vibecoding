import { useTetris } from './useTetris';
import './Tetris.css';

const CELL_SIZE = 30;

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
  const { board, next, score, lines, gameOver, paused, reset, setPaused } = useTetris();

  return (
    <div className="tetris-wrapper">
      <div className="tetris-container">
        <div
          className="tetris-board"
          style={{
            width: 10 * CELL_SIZE,
            height: 20 * CELL_SIZE,
          }}
        >
          {board.map((row, r) =>
            row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                className={`cell ${cell === 'ghost' ? 'ghost' : cell ? 'filled' : ''}`}
                style={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  background: cell === 'ghost' ? 'transparent' : (cell ?? 'transparent'),
                  border: cell === 'ghost' ? '1px dashed rgba(255,255,255,0.25)' : undefined,
                }}
              />
            ))
          )}
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
