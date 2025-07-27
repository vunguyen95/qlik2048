import { useState, useEffect, useCallback } from "react";
import "./App.css";
import utils from "./utility.js"; //utility function

/*---------------------------Tile---------------------------------*/
function Tile({ value, isNew, movement, isMerged }) {
  //get Tile class value
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
    const totalSize = tileSize + gap; // 95px width + 10px gap
    const deltaX = (movement.to.col - movement.from.col) * totalSize;
    const deltaY = (movement.to.row - movement.from.row) * totalSize;

    //Syntax lession: ' ' : properties
    // ` ' template literal
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
  //useEffect for side effects ( event listener and clean up) onMove,.
  //dependencies are onMove, passed by handleMove in Game().
  useEffect(() => {
    //get the direction
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

      //disable scrolling
      event.preventDefault();
      if (direction) {
        onMove(direction);
      }
    };

    //Add event listener
    window.addEventListener("keydown", handleKey);
    //Remember cleaning up, otherwise trouble!
    return () => {
      window.removeEventListener("keydown", handleKey);
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
  //React state variables and update function.
  const [board, setBoard] = useState(utils.initializeBoard()); // initializeBoard when first rendered
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [bestScore, setBestScore] = useState(0);

  //Animation (new tile, movement)
  const [newTile, setNewTile] = useState(null);
  const [movementData, setMovementData] = useState(null);
  const [mergedTiles, setMergedTiles] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false); // to disable animation while merging.

  //No dependency, initialize once
  useEffect(() => {
    let firstBoard = utils.initializeBoard();
    const pos1 = utils.addRandomTile(firstBoard);
    const pos2 = utils.addRandomTile(firstBoard);
    setBoard(firstBoard);
    setNewTile([pos1, pos2]);
  }, []);

  //check game over. Run when board changes.
  useEffect(() => {
    if (utils.checkGameOver(board)) {
      setGameOver(true);
      //wait for animation to complete
      setTimeout(() => {
        window.alert("Game Over!");
      }, 200);
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
    if (movementData) {
      const timer = setTimeout(() => {
        setMovementData(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [movementData]);

  //Core logic, passed down to onMove
  //useCallback for efficient rendering, depending on the board, score, and gameOver.
  const handleMove = useCallback(
    (direction) => {
      if (isAnimating || gameOver) return;
      //process the board, pass to utils.merge()
      let newBoard = board.map((row) => [...row]);
      let newScore = score;
      let boardChange = false; //for update function.
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

        //Be careful when comparing and update. Also, pure === is comparing reference in JS.
        //wrong state management -> weird result
        //Is it better to compare every row (column) or once at the end?
        if (JSON.stringify(processedArr) !== JSON.stringify(originalArr)) {
          boardChange = true;
        }
        //update newBoard for setBoard. Immutability thingy with React
        if (isRow) {
          newBoard[idx] = processedArr; //update row
        } else {
          for (let r = 0; r < size; r++) {
            newBoard[r][idx] = processedArr[r]; // update column
          }
        }

        //Absolute position
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
        console.log(absMovements);
        newScore = updatedScore;
      }

      if (boardChange) {
        //phase 1: animation
        setIsAnimating(true);
        setMovementData(movementData); //comment to DISABLE animation for the moment

        //phase 2: update
        setTimeout(() => {
          setScore(newScore);
          const posNew = utils.addRandomTile(newBoard);
          setNewTile(posNew);
          setMergedTiles(allMergedTiles);
          setBoard(newBoard);
          //setMovementData(null); //Uncomment to Disable animation
          setMergedTiles([]);
          setIsAnimating(false);
        }, 2900);
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
        <h1 className="title"> 2048 </h1>
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
        {/*<div className="score-thing"> Score: {score} </div> */}
        <Grid
          board={board}
          onMove={handleMove}
          //animation props passing.
          newTile={newTile}
          movementData={movementData}
          mergedTiles={mergedTiles}
        />
        <button onClick={handleRestart} className="button">
          {" "}
          Restart Game
        </button>
      </div>
    </div>
  );
}

export default Game;
