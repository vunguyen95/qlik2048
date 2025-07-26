import { useState, useEffect, useCallback } from "react";
import "./App.css";
import utils from "./utility.js"; //utility function

/*---------------------------Tile---------------------------------*/
function Tile({ value, isNew }) {
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
  return (
    <div className={`${getClass(value)} ${isNew ? "new" : " "}`}>
      {value || " "}{" "}
    </div>
  );
}

/*---------------------------Grid---------------------------------*/
function Grid({ board, onMove, newTile }) {
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

  return (
    <div className="grid-container">
      {board.map((row, rowIndex) =>
        row.map((tileValue, colIndex) => (
          <Tile
            key={`${rowIndex}-${colIndex}`}
            value={tileValue}
            isNew={
              Array.isArray(newTile)
                ? newTile.some(
                    (pos) => pos.row == rowIndex && pos.col == colIndex
                  )
                : tileValue !== 0 &&
                  newTile?.row === rowIndex &&
                  newTile.col === colIndex
            }
          />
        ))
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

  //Animation (new tile, movement)
  const [newTile, setNewTile] = useState(null);

  // Initialize an empty board, add two random tiles.
  //No dependency, initialize once
  useEffect(() => {
    let firstBoard = utils.initializeBoard();
    const pos1 = utils.addRandomTile(firstBoard);
    const pos2 = utils.addRandomTile(firstBoard);
    setBoard(firstBoard);
    setNewTile([pos1, pos2]);
  }, []);

  //Core logic, passed down to onMove
  //useCallback for efficient rendering, depending on the board, score, and gameOver.
  const handleMove = useCallback(
    (direction) => {
      //process the board, pass to utils.merge()
      let newBoard = board.map((row) => [...row]);
      let newScore = score;
      let boardChange = false; //for update function.

      const isRow = direction === "left" || direction == "right";
      const size = newBoard.length;
      for (let idx = 0; idx < size; idx++) {
        let originalArr = utils.getLine(newBoard, idx, isRow);
        const { processedArr, score: updatedScore } = utils.merge(
          originalArr,
          newScore,
          direction
        );

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
        newScore = updatedScore;
      }

      if (boardChange) {
        const posNew = utils.addRandomTile(newBoard);
        setBoard(newBoard);
        setScore(newScore);
        setNewTile(posNew);
      }
    },
    [board, score, gameOver]
  );

  const handleRestart = () => {
    //utils.initializeBoard, utils.addRandomTile()
  };

  return (
    <div className="game-container">
      <h1 className="title"> 2048 with React </h1>
      <div className="game-card">
        <div className="score-thing"> Score: {score} </div>

        <Grid
          board={board}
          onMove={handleMove}
          //animation props passing.
          newTile={newTile}
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
