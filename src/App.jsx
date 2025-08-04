import { useState, useEffect, useCallback, useRef } from "react";
import {
  FaPlay,
  FaPause,
  FaVolumeMute,
  FaVolumeUp,
  FaSun,
  FaMoon,
} from "react-icons/fa";
import "./style/global.css";
import "./style/overlay.css";
import "./style/button.css";

import Grid from "./components/Grid/Grid.jsx";
import utils from "./utils/utility.js";
import * as constants from "./constants/game.js";

//Game Configuration. Moved out of the component to avoid re-initializing on every render.
const gameConfig = {
  "--tile-width": `${constants.TILE_WIDTH}px`,
  "--tile-height": `${constants.TILE_HEIGHT}px`,
  "--icon-size": `${constants.ICON_SIZE}px`,
  "--gap-size": `${constants.GAP_SIZE}px`,
  "--animation-slide-duration": `${constants.ANIMATION_SLIDE_DURATION}ms`,
  "--animation-merge-duration": `${constants.ANIMATION_MERGE_DURATION}ms`,
  "--animation-new-tile-duration": `${constants.ANIMATION_NEW_TILE_DURATION}ms`,
};

function Game() {
  const [board, setBoard] = useState(utils.initializeBoard());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [bestScore, setBestScore] = useState(0);
  const [highestTile, setHighestTile] = useState(0);
  const [showWinBox, setShowWinBox] = useState(false);

  const [newTile, setNewTile] = useState(null);
  const [movementData, setMovementData] = useState(null);
  const [mergedTiles, setMergedTiles] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const [isPaused, setIsPaused] = useState(false);
  const [isMute, setIsMute] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const slideSound = useRef(null); //dont create a new sound every render.
  const mergeSound = useRef(null);

  //one-time things deps = []: sound, initialize board, bestScore. (set-up and retrieve)
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
    const savedBestScore = localStorage.getItem("bestScore");
    if (savedBestScore) {
      setBestScore(parseInt(savedBestScore));
    }
  }, []);

  useEffect(() => {
    if (utils.checkGameOver(board)) {
      setGameOver(true);
    }
  }, [board]);

  useEffect(() => {
    const maxTile = utils.getHighestTile(board);
    setHighestTile(maxTile);
  }, [board]);

  useEffect(() => {
    if (highestTile === constants.WIN_TILE && !hasWon) {
      setHasWon(true);
      setShowWinBox(true);
    }
  }, [highestTile, hasWon]);
  //useEffect for better performance.
  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem("bestScore", score);
      // if I use bestScore, it will be lagged behind, as the bestScore has not been updated yet.
      //It will be only updated when Game is re-rendered.
      //set will not update the state immediately!
    }
  }, [score, bestScore]);

  useEffect(() => {
    if (mergedTiles.length > 0) {
      const timer = setTimeout(
        () => setMergedTiles([]),
        constants.ANIMATION_MERGE_DURATION
      );
      return () => clearTimeout(timer);
    }
  }, [mergedTiles]);

  useEffect(() => {
    if (newTile) {
      const timer = setTimeout(
        () => setNewTile(null),
        constants.ANIMATION_NEW_TILE_DURATION
      );
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
        }, constants.ANIMATION_SLIDE_DURATION);
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
    setShowWinBox(false);
    setHasWon(false);
    setHighestTile(0);
    setIsAnimating(false); // probably not needed
  };

  // Some of these might be better as functional updates (s => !s) and wrapped in useCallback with empty dependencies.
  //avoid dependencies on state variables.
  const handleContinue = () => {
    setShowWinBox(false);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };
  const handleMute = () => {
    setIsMute(!isMute);
  };
  const handleDark = () => {
    setIsDark(!isDark);
  };

  return (
    <div
      className={`game-container ${isDark ? "dark" : ""}`}
      style={gameConfig}
    >
      <div className="header">
        <h1
          className={`title-box ${isDark ? "dark" : ""}`}
          style={{ lineHeight: 1 }}
        >
          2048 <br /> <span style={{ fontSize: "0.5em" }}> by Vu </span>
        </h1>
        <div className="right-header">
          <div className="score-box">
            <div className="score-container">
              <div className={`score-title ${isDark ? "dark" : ""}`}>Score</div>
              <div className={`score-value ${isDark ? "dark" : ""}`}>
                {score}
              </div>
            </div>
            <div className="score-container">
              <div className={`score-title ${isDark ? "dark" : ""}`}>Best</div>
              <div className={`score-value ${isDark ? "dark" : ""}`}>
                {bestScore}
              </div>
            </div>
          </div>
          <div className="icon-box">
            <button className="icon-button" onClick={handlePause}>
              {isPaused ? (
                <FaPlay size={constants.ICON_SIZE} />
              ) : (
                <FaPause size={constants.ICON_SIZE} />
              )}
            </button>
            <button className="icon-button" onClick={handleMute}>
              {isMute ? (
                <FaVolumeMute size={constants.ICON_SIZE} />
              ) : (
                <FaVolumeUp size={constants.ICON_SIZE} />
              )}
            </button>
            <button className="icon-button" onClick={handleDark}>
              {isDark ? (
                <FaSun size={constants.ICON_SIZE} />
              ) : (
                <FaMoon size={constants.ICON_SIZE} />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className={`game-card ${isDark ? "dark" : ""}`}>
        <Grid
          board={board}
          onMove={handleMove}
          newTile={newTile}
          movementData={movementData}
          mergedTiles={mergedTiles}
        />
        <button
          onClick={handleRestart}
          className={`button ${isDark ? "dark" : ""}`}
        >
          Restart Game
        </button>
      </div>
      {gameOver && (
        <div className="game-over-overlay">
          <div className="game-over-box">
            <h2>Game Over! You score: {score} points</h2>
            <button
              onClick={handleRestart}
              className={`button ${isDark ? "dark" : " "}`}
            >
              Restart Game
            </button>
          </div>
        </div>
      )}
      {isPaused && (
        <div className="pause-overlay">
          <div className="pause-box">
            <h2> Paused</h2>
            <button
              onClick={handlePause}
              className={`button ${isDark ? "dark" : " "}`}
            >
              Resume
            </button>
          </div>
        </div>
      )}
      {showWinBox && (
        <div className="win-overlay">
          <div className="win-box">
            <h2> You won! Wanna test your limit?</h2>
            <div className="win-box-container">
              <button
                className={`button ${isDark ? "dark" : " "}`}
                onClick={handleContinue}
              >
                Continue
              </button>
              <button
                className={`button ${isDark ? "dark" : " "}`}
                onClick={handleRestart}
              >
                New Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Game;
