import { useState, useEffect, useCallback, useRef } from "react";
import { FaPlay, FaPause, FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import "./style/global.css";
import "./components/Grid/Grid.css";
import "./components/Tile/Tile.css";
import "./overlay.css";

import Grid from "./components/Grid/Grid.jsx";
import utils from "./utils/utility.js";
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

  const [isPaused, setIsPaused] = useState(false);
  const [isMute, setIsMute] = useState(false);

  const slideSound = useRef(null); //dont create a new sound every render.
  const mergeSound = useRef(null);
  useEffect(() => {
    slideSound.current = new Audio("/sounds/slide.wav");
    mergeSound.current = new Audio("/sounds/merge.wav");
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
      if (isAnimating || gameOver || isPaused) return; //NO INPUT DURING ANIMATION, OTHERWISE MIXED UP BOARD STATE.

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
        if (!isMute) {
          if (allMergedTiles.length > 0) {
            mergeSound.current.currentTime = 0;
            mergeSound.current.play();
          } else {
            slideSound.current.currentTime = 0;
            slideSound.current.play();
          }
        }
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
    [board, score, gameOver, isAnimating, isMute, isPaused]
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

  const handlePause = () => {
    setIsPaused(!isPaused);
  };
  const handleMute = () => {
    setIsMute(!isMute);
  };
  return (
    <div className="game-container">
      <div className="header">
        <h1 className="title-box" style={{ lineHeight: 1 }}>
          2048 <br /> <span style={{ fontSize: "0.5em" }}> by Vu </span>
        </h1>
        <div className="right-header">
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
          <div className="button-box">
            <button className="icon-button" onClick={handlePause}>
              {isPaused ? <FaPause size="30px" /> : <FaPlay size="30px" />}
            </button>
            <button className="icon-button" onClick={handleMute}>
              {isMute ? (
                <FaVolumeMute size="30px" />
              ) : (
                <FaVolumeUp size="30px" />
              )}
            </button>
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
      {isPaused && (
        <div className="pause-overlay">
          <div className="pause-box">
            <h2> Paused</h2>
            <button onClick={handlePause} className="button">
              Resume
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Game;
