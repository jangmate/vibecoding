import { useState, useEffect, useCallback, useRef } from 'react';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const TICK_INTERVAL = 500;

type Cell = string | null;
type Board = Cell[][];

const TETROMINOES: Record<string, { shape: number[][]; color: string }> = {
  I: { shape: [[1, 1, 1, 1]], color: '#00f0f0' },
  O: { shape: [[1, 1], [1, 1]], color: '#f0f000' },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: '#a000f0' },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: '#00f000' },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: '#f00000' },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: '#0000f0' },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: '#f0a000' },
};

const TETROMINO_KEYS = Object.keys(TETROMINOES);

function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(null));
}

function randomTetromino() {
  const key = TETROMINO_KEYS[Math.floor(Math.random() * TETROMINO_KEYS.length)];
  return { key, ...TETROMINOES[key] };
}

function rotate(shape: number[][]): number[][] {
  return shape[0].map((_, i) => shape.map(row => row[i]).reverse());
}

function isValid(board: Board, shape: number[][], x: number, y: number): boolean {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const nr = y + r;
      const nc = x + c;
      if (nr < 0 || nr >= BOARD_HEIGHT || nc < 0 || nc >= BOARD_WIDTH) return false;
      if (board[nr][nc]) return false;
    }
  }
  return true;
}

function placePiece(board: Board, shape: number[][], x: number, y: number, color: string): Board {
  const newBoard = board.map(row => [...row]);
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        newBoard[y + r][x + c] = color;
      }
    }
  }
  return newBoard;
}

function clearLines(board: Board): { board: Board; cleared: number } {
  const newBoard = board.filter(row => row.some(cell => !cell));
  const cleared = BOARD_HEIGHT - newBoard.length;
  const emptyRows = Array.from({ length: cleared }, () => Array(BOARD_WIDTH).fill(null));
  return { board: [...emptyRows, ...newBoard], cleared };
}

export function useTetris() {
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [current, setCurrent] = useState(() => randomTetromino());
  const [next, setNext] = useState(() => randomTetromino());
  const [pos, setPos] = useState({ x: 3, y: 0 });
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);

  const boardRef = useRef(board);
  const currentRef = useRef(current);
  const posRef = useRef(pos);
  const gameOverRef = useRef(gameOver);
  const pausedRef = useRef(paused);

  boardRef.current = board;
  currentRef.current = current;
  posRef.current = pos;
  gameOverRef.current = gameOver;
  pausedRef.current = paused;

  const spawnNext = useCallback((boardState: Board, nextPiece: ReturnType<typeof randomTetromino>) => {
    const startX = Math.floor((BOARD_WIDTH - nextPiece.shape[0].length) / 2);
    const startY = 0;
    if (!isValid(boardState, nextPiece.shape, startX, startY)) {
      setGameOver(true);
      return;
    }
    setCurrent(nextPiece);
    setNext(randomTetromino());
    setPos({ x: startX, y: startY });
  }, []);

  const lockPiece = useCallback(() => {
    const b = boardRef.current;
    const c = currentRef.current;
    const p = posRef.current;
    const newBoard = placePiece(b, c.shape, p.x, p.y, c.color);
    const { board: clearedBoard, cleared } = clearLines(newBoard);
    setBoard(clearedBoard);
    if (cleared > 0) {
      setScore(s => s + [0, 100, 300, 500, 800][cleared]);
      setLines(l => l + cleared);
    }
    spawnNext(clearedBoard, next);
  }, [next, spawnNext]);

  const moveDown = useCallback(() => {
    if (gameOverRef.current || pausedRef.current) return;
    const { x, y } = posRef.current;
    const c = currentRef.current;
    if (isValid(boardRef.current, c.shape, x, y + 1)) {
      setPos(p => ({ ...p, y: p.y + 1 }));
    } else {
      lockPiece();
    }
  }, [lockPiece]);

  const moveLeft = useCallback(() => {
    if (gameOverRef.current || pausedRef.current) return;
    const { x, y } = posRef.current;
    const c = currentRef.current;
    if (isValid(boardRef.current, c.shape, x - 1, y)) {
      setPos(p => ({ ...p, x: p.x - 1 }));
    }
  }, []);

  const moveRight = useCallback(() => {
    if (gameOverRef.current || pausedRef.current) return;
    const { x, y } = posRef.current;
    const c = currentRef.current;
    if (isValid(boardRef.current, c.shape, x + 1, y)) {
      setPos(p => ({ ...p, x: p.x + 1 }));
    }
  }, []);

  const rotatePiece = useCallback(() => {
    if (gameOverRef.current || pausedRef.current) return;
    const { x, y } = posRef.current;
    const c = currentRef.current;
    const rotated = rotate(c.shape);
    if (isValid(boardRef.current, rotated, x, y)) {
      setCurrent(prev => ({ ...prev, shape: rotated }));
    } else if (isValid(boardRef.current, rotated, x - 1, y)) {
      setCurrent(prev => ({ ...prev, shape: rotated }));
      setPos(p => ({ ...p, x: p.x - 1 }));
    } else if (isValid(boardRef.current, rotated, x + 1, y)) {
      setCurrent(prev => ({ ...prev, shape: rotated }));
      setPos(p => ({ ...p, x: p.x + 1 }));
    }
  }, []);

  const hardDrop = useCallback(() => {
    if (gameOverRef.current || pausedRef.current) return;
    let { x, y } = posRef.current;
    const c = currentRef.current;
    while (isValid(boardRef.current, c.shape, x, y + 1)) y++;
    setPos(p => ({ ...p, y }));
    setTimeout(() => lockPiece(), 0);
  }, [lockPiece]);

  const reset = useCallback(() => {
    const newBoard = createEmptyBoard();
    const first = randomTetromino();
    const second = randomTetromino();
    const startX = Math.floor((BOARD_WIDTH - first.shape[0].length) / 2);
    setBoard(newBoard);
    setCurrent(first);
    setNext(second);
    setPos({ x: startX, y: 0 });
    setScore(0);
    setLines(0);
    setGameOver(false);
    setPaused(false);
  }, []);

  // Tick
  useEffect(() => {
    if (gameOver || paused) return;
    const id = setInterval(moveDown, TICK_INTERVAL);
    return () => clearInterval(id);
  }, [gameOver, paused, moveDown]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft': e.preventDefault(); moveLeft(); break;
        case 'ArrowRight': e.preventDefault(); moveRight(); break;
        case 'ArrowDown': e.preventDefault(); moveDown(); break;
        case 'ArrowUp': e.preventDefault(); rotatePiece(); break;
        case ' ': e.preventDefault(); hardDrop(); break;
        case 'p':
        case 'P': setPaused(p => !p); break;
        case 'r':
        case 'R': reset(); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [moveLeft, moveRight, moveDown, rotatePiece, hardDrop, reset]);

  // Render board with current piece
  const displayBoard: Board = board.map(row => [...row]);
  if (!gameOver) {
    const { shape, color } = current;
    const { x, y } = pos;
    // Ghost piece
    let ghostY = y;
    while (isValid(board, shape, x, ghostY + 1)) ghostY++;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          if (ghostY + r >= 0 && ghostY + r < BOARD_HEIGHT) {
            if (!displayBoard[ghostY + r][x + c]) {
              displayBoard[ghostY + r][x + c] = 'ghost';
            }
          }
          if (y + r >= 0 && y + r < BOARD_HEIGHT) {
            displayBoard[y + r][x + c] = color;
          }
        }
      }
    }
  }

  return {
    board: displayBoard,
    next,
    score,
    lines,
    gameOver,
    paused,
    reset,
    setPaused,
  };
}
