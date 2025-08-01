import React from "react";
import {
  TILE_HEIGHT,
  TILE_WIDTH,
  GAP_SIZE,
  VALUE_SIZE,
} from "../../constants/game.js";
function Tile({ value, isNew, movement, isMerged }) {
  const getClass = (value) => {
    if (!value) {
      return "tile tile-null";
    }
    if (value > 2048) {
      return "tile tile-max";
    }
    return `tile tile-${value}`;
  };

  const getFontSize = () => {
    if (!value) return {};
    const numDigits = value.toString().length;
    if (numDigits <= 2) return `${VALUE_SIZE}px`;
    if (numDigits > 2) return `${VALUE_SIZE - (numDigits - 2) * 5}px`;
  };
  const getMovementStyle = () => {
    if (!movement) return {};

    const tileWidth = TILE_WIDTH;
    const tileHeight = TILE_HEIGHT;
    const gap = GAP_SIZE;
    const deltaX = (movement.to.col - movement.from.col) * (tileWidth + gap);
    const deltaY = (movement.to.row - movement.from.row) * (tileHeight + gap);

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
      style={{ ...movementStyle, fontSize: getFontSize() }}
    >
      {value || " "}{" "}
    </div>
  );
}

export default Tile;
