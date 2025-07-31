import React, { useEffect } from "react";
import Tile from "../Tile/Tile.jsx";

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

export default Grid;
