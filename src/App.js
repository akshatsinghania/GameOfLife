import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const CELL_SIZE = 20;
  const WIDTH = 800;
  const HEIGHT = 600;
  var [rows, setRows] = useState(0);
  var [cols, setCols] = useState(0);
  var [grid, setGrid] = useState([[]]);
  var [cells, setCells] = useState([[]]);
  const [gridRef, setGridRef] = useState(null);
  const [interval, setInverval] = useState(400);
  const [isRunning, setIsRunning] = useState(false);
  var [timeoutHandler, setTimeoutHandler] = useState(null);
  const [temp, setTemp] = useState(0);
  useEffect(() => {
    rows = HEIGHT / CELL_SIZE;
    cols = WIDTH / CELL_SIZE;
    grid = initializeGrid(rows, cols);
    cells = generateCells(rows, cols, grid);
    setRows(rows);
    setCols(cols);
    setGrid(grid);
    setCells([...cells]);
  }, []);

  const initializeGrid = (rl = rows, cl = cols) => {
    let grid_temp = [];
    for (let y = 0; y < rl; y++) {
      grid_temp.push([]);
      for (let x = 0; x < cl; x++) {
        grid_temp[y][x] = 0;
      }
    }

    return grid_temp;
  };
  const Cell = ({ x, y }) => {
    return (
      <div
        className={`Cell`}
        style={{
          left: `${CELL_SIZE * x + 1}px`,
          top: `${CELL_SIZE * y + 1}px`,
          width: `${CELL_SIZE - 1}px`,
          height: `${CELL_SIZE - 1}px`,
        }}
      />
    );
  };
  const generateCells = (rl, cl, g) => {
    let cells_temp = [];
    for (let y = 0; y < rl; y++) {
      for (let x = 0; x < cl; x++) {
        if (g[y][x]) {
          cells_temp.push({ x, y });
        }
      }
    }
    return cells_temp;
  };
  const getElementOffset = () => {
    const rect = gridRef.getBoundingClientRect();
    const doc = document.documentElement;
    return {
      x: rect.left + window.pageXOffset - doc.clientLeft,
      y: rect.top + window.pageYOffset - doc.clientTop,
    };
  };
  const handleClick = (event) => {
    const elemOffset = getElementOffset();
    const offsetX = event.clientX - elemOffset.x;
    const offsetY = event.clientY - elemOffset.y;

    const x = Math.floor(offsetX / CELL_SIZE);
    const y = Math.floor(offsetY / CELL_SIZE);

    if (x >= 0 && x <= cols && y >= 0 && y <= rows) {
      grid[y][x] = !grid[y][x];
    }
    setGrid([...grid]);
  };

  const calculateNeighbors = (grid, x, y) => {
    let neighbors = 0;
    const dirs = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, 1],
      [1, 1],
      [1, 0],
      [1, -1],
      [0, -1],
    ];
    for (let i = 0; i < dirs.length; i++) {
      const dir = dirs[i];
      let y1 = y + dir[0];
      let x1 = x + dir[1];

      if (x1 >= 0 && x1 < cols && y1 >= 0 && y1 < rows && grid[y1][x1]) {
        neighbors++;
      }
    }

    return neighbors;
  };

  const runGame = () => {
    setIsRunning(true);
    runIteration();
  };

  const stopGame = () => {
    setIsRunning(false);
    if (timeoutHandler) {
      window.clearInterval(timeoutHandler);
      setTimeoutHandler(null);
    }
  };
  const handleClear = () => {
    setGrid(initializeGrid());
  };

  const handleRandom = () => {
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        grid[y][x] = Math.random() >= 0.5;
      }
    }

    setGrid([...grid]);
  };
  const runIteration = (board = grid) => {
    let newGrid = initializeGrid();

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        let neighbors = calculateNeighbors(board, x, y);
        if (board[y][x]) {
          if (neighbors === 2 || neighbors === 3) {
            newGrid[y][x] = true;
          } else {
            newGrid[y][x] = false;
          }
        } else {
          if (!board[y][x] && neighbors === 3) {
            newGrid[y][x] = true;
          }
        }
      }
    }
    console.log("run");
    setTemp((temp) => temp + 1);
    setGrid([...newGrid]);
    setCells(generateCells(rows, cols, newGrid));
  };
  useEffect(() => {
    if (!isRunning) return;
    setTimeoutHandler(setTimeout(runIteration, interval));
  }, [cells]);
  useEffect(() => {
    if (isRunning) return;
    cells = generateCells(rows, cols, grid);
    setCells(cells);
  }, [grid]);

  return (
    <div className="App">
      <div
        className="Board"
        style={{
          width: WIDTH,
          height: HEIGHT,
          backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
        }}
        onClick={(e) => handleClick(e)}
        ref={(n) => {
          setGridRef(n);
        }}
      >
        {cells.map((cell) => {
          return <Cell x={cell.x} y={cell.y} key={`${cell.x},${cell.y}`} />;
        })}
      </div>
      <div className="controls">
        Update every
        <input
          type={"number"}
          className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={interval}
          onChange={(e) => setInverval(Number(e.target.value))}
        />
        msec
        {isRunning ? (
          <button className="button" onClick={stopGame}>
            Stop
          </button>
        ) : (
          <button className="button" onClick={runGame}>
            Run
          </button>
        )}
        <button className="button" onClick={handleRandom}>
          Random
        </button>
        <button className="button" onClick={handleClear}>
          Clear
        </button>
      </div>
    </div>
  );
}

export default App;
