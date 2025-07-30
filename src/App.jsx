import { useState, useEffect, useCallback } from "react";
import "./App.css";
import utils from "./utility.js";

/*---------------------------Tile---------------------------------*/
function Tile({ value, isNew, movement, isMerged }) {
  const getClass = (value) => {
    if (!value) {
      return `tile tile-null`;
    }
    if (value > 2048) {
      return `tile tile-max`;
    }
    return `tile tile-${value}`;
  };

  const getMovementStyle = () => {
    if (!movement) return {};

    const tileSize = 95;
    const gap = 10;
    const totalSize = tileSize + gap;
    const deltaX = (movement.to.col - movement.from.col) * totalSize;
    const deltaY = (movement.to.row - movement.from.row) * totalSize;

    return {
      "--move-x": `${deltaX}px`,
      "--move-y": `${deltaY}px`,
    };
  };

  const movementStyle = getMovementStyle();

  return (
    <div
      className={`${getClass(value)} ${isNew ? "new" : " "} ${
        movement ? "sliding" : ""
      } ${isMerged ? "merged" : " "}`}
      style={movementStyle}
    >
      {value || " "}{" "}
    </div>
  );
}

/*---------------------------Grid---------------------------------*/
function Grid({ board, onMove, newTile, movementData, mergedTiles }) {
  useEffect(() => {
    let direction = null;
    const handleKey = (event) => {
      switch (event.key) {
        case "ArrowUp":
          direction = "up";
          break;
        case "ArrowDown":
          direction = "down";
          break;
        case "ArrowLeft":
          direction = "left";
          break;
        case "ArrowRight":
          direction = "right";
          break;
        default:
          return;
      }

      event.preventDefault();
      if (direction) {
        onMove(direction);
      }
    };

    let startX = null;
    let startY = null;
    let minDistance = 50;

    const handleTouchStart = (event) => {
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
    };
    const handleTouchEnd = (event) => {
      let direction = null;
      const endX = event.changedTouches[0].clientX;
      const endY = event.changedTouches[0].clientY;
      const deltaX = Math.abs(endX - startX);
      const deltaY = Math.abs(endY - startY);
      if (deltaX < minDistance && deltaY < minDistance) return;
      if (deltaX > deltaY) {
        direction = endX > startX ? "right" : "left";
      }
      if (deltaY > deltaX) {
        direction = endY > startY ? "down" : "up";
      }

      event.preventDefault();
      if (direction) {
        onMove(direction);
      }
      startX = null;
      startY = null;
    };

    const handleTouchMove = (event) => {
      event.preventDefault();
    };

    window.addEventListener("keydown", handleKey);
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    //Remember cleaning up, otherwise trouble!
    return () => {
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("touchstart", handleTouchStart, {
        passive: false,
      });
      window.removeEventListener("touchend", handleTouchEnd, {
        passive: false,
      });
      window.removeEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
    };
  }, [onMove]);

  const getTileMovement = (rowIndex, colIndex) => {
    if (!movementData) return null;
    return movementData.find(
      (movement) =>
        movement.from.row === rowIndex && movement.from.col === colIndex
    );
  };

  const isMerged = (rowIndex, colIndex) => {
    if (!mergedTiles) return false;
    return mergedTiles.some(
      (pos) => pos.row === rowIndex && pos.col === colIndex
    );
  };

  return (
    <div className="grid-container">
      {Array(4)
        .fill(null)
        .map((_, rowIndex) =>
          Array(4)
            .fill(null)
            .map((_, colIndex) => (
              <div
                key={`bg-${rowIndex}-${colIndex}`}
                className="tile tile-null"
                style={{
                  position: "absolute",
                  left: `${10 + colIndex * 105}px`,
                  top: `${10 + rowIndex * 110}px`,
                  zIndex: 0,
                }}
              />
            ))
        )}
      {board.map((row, rowIndex) =>
        row.map((tileValue, colIndex) => {
          const movement = getTileMovement(rowIndex, colIndex);

          return (
            <Tile
              key={`${rowIndex}-${colIndex}`}
              value={tileValue}
              isNew={
                Array.isArray(newTile)
                  ? newTile.some(
                      (pos) => pos.row == rowIndex && pos.col == colIndex
                    )
                  : tileValue !== null &&
                    newTile?.row === rowIndex &&
                    newTile?.col === colIndex
              }
              movement={movement}
              isMerged={isMerged(rowIndex, colIndex)}
            />
          );
        })
      )}
    </div>
  );
}

/*---------------------------Game---------------------------------*/
function Game() {
  const [board, setBoard] = useState(utils.initializeBoard());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [bestScore, setBestScore] = useState(0);

  const [newTile, setNewTile] = useState(null);
  const [movementData, setMovementData] = useState(null);
  const [mergedTiles, setMergedTiles] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    let firstBoard = utils.initializeBoard();
    const pos1 = utils.addRandomTile(firstBoard);
    const pos2 = utils.addRandomTile(firstBoard);
    setBoard(firstBoard);
    setNewTile([pos1, pos2]);
  }, []);

  useEffect(() => {
    if (utils.checkGameOver(board)) {
      setGameOver(true);
    }
  }, [board]);

  //best Score
  useEffect(() => {
    const savedBestScore = localStorage.getItem("bestScore");
    if (savedBestScore) {
      setBestScore(parseInt(savedBestScore));
    }
  }, []);

  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem("bestScore", bestScore);
    }
  }, [score, bestScore]);

  useEffect(() => {
    if (mergedTiles.length > 0) {
      const timer = setTimeout(() => setMergedTiles([]), 300);
      return () => clearTimeout(timer);
    }
  }, [mergedTiles]);

  useEffect(() => {
    if (newTile) {
      const timer = setTimeout(() => setNewTile(null), 200);
      return () => clearTimeout(timer);
    }
  }, [newTile]);

  const handleMove = useCallback(
    (direction) => {
      if (isAnimating || gameOver) return; //NO INPUT DURING ANIMATION, OTHERWISE MIXED UP BOARD STATE.

      let newBoard = board.map((row) => [...row]);
      let newScore = score;
      let boardChange = false;
      let movementData = [];
      let allMergedTiles = [];

      const isRow = direction === "left" || direction == "right";
      const size = newBoard.length;
      for (let idx = 0; idx < size; idx++) {
        let originalArr = utils.getLine(newBoard, idx, isRow);
        const {
          processedArr,
          score: updatedScore,
          movement,
          mergedTiles,
        } = utils.merge(originalArr, newScore, direction);

        if (JSON.stringify(processedArr) !== JSON.stringify(originalArr)) {
          boardChange = true;
        }

        if (isRow) {
          newBoard[idx] = processedArr;
        } else {
          for (let r = 0; r < size; r++) {
            newBoard[r][idx] = processedArr[r];
          }
        }

        const absMovements = movement.map(({ from, to, value }) => {
          if (isRow) {
            return {
              from: { row: idx, col: from },
              to: { row: idx, col: to },
              value,
            };
          } else {
            return {
              from: { row: from, col: idx },
              to: { row: to, col: idx },
              value,
            };
          }
        });
        const absMergedTiles = mergedTiles.map((pos) => {
          if (isRow) {
            return { row: idx, col: pos };
          } else {
            return { row: pos, col: idx };
          }
        });

        allMergedTiles.push(...absMergedTiles);
        movementData.push(...absMovements);
        newScore = updatedScore;
      }

      if (boardChange) {
        //phase 1: SLIDING ONLY
        setIsAnimating(true);
        setMovementData(movementData);

        //phase 2: update
        setTimeout(() => {
          setMergedTiles(allMergedTiles);
          setBoard(newBoard);
          const posNew = utils.addRandomTile(newBoard);
          setNewTile(posNew);
          setScore(newScore);
          setMovementData(null); //Dont forget.
          setIsAnimating(false); // Dont forget
        }, 200);
      }
    },
    [board, score, gameOver, isAnimating]
  );

  const handleRestart = () => {
    let freshBoard = utils.initializeBoard();
    const pos1 = utils.addRandomTile(freshBoard);
    const pos2 = utils.addRandomTile(freshBoard);
    setBoard(freshBoard);
    setNewTile([pos1, pos2]);
    setScore(0);
    setMovementData(null);
    setMergedTiles([]);
    setGameOver(false);
  };

  return (
    <div className="game-container">
      <div className="header">
        <h1 className="title" style={{ lineHeight: 1 }}>
          2048 <br /> <span style={{ fontSize: "0.5em" }}> by Vu </span>
        </h1>
        <div className="score-box">
          <div className="score-container">
            <div className="score-title"> Score </div>
            <div className="score-value"> {score} </div>
          </div>
          <div className="score-container">
            <div className="score-title"> Best </div>
            <div className="score-value"> {bestScore} </div>
          </div>
        </div>
      </div>

      <div className="game-card">
        <Grid
          board={board}
          onMove={handleMove}
          newTile={newTile}
          movementData={movementData}
          mergedTiles={mergedTiles}
        />
        <button onClick={handleRestart} className="button">
          Restart Game
        </button>
      </div>
      {gameOver && (
        <div className="game-over-overlay">
          <div className="game-over-box">
            <h2>Game Over! You score: {score} points</h2>
            <button onClick={handleRestart} className="button">
              Restart Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Game;
