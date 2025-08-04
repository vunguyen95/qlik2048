import React from "react";
import "./Tile.css";
import {
  TILE_HEIGHT,
  TILE_WIDTH,
  GAP_SIZE,
  VALUE_SIZE,
} from "../../constants/game.js";

//Extracting the tile (pure) helper functions out of the component to avoid re-initializing on every render.
//If they are inside, consider using useMemo

const getClass = (value) => {
  if (!value) {
    return "tile tile-null";
  }
  if (value > 2048) {
    return "tile tile-max";
  }
  return `tile tile-${value}`;
};

const getFontSize = (value) => {
  if (!value) return null;
  const numDigits = value.toString().length;
  if (numDigits <= 2) {
    return `${VALUE_SIZE}px`;
  } else {
    return `${VALUE_SIZE - (numDigits - 2) * 5}px`;
  }
};

const getMovementStyle = (movement) => {
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
function Tile({ value, isNew, movement, isMerged }) {
  const movementStyle = getMovementStyle(movement);

  return (
    <div
      className={`${getClass(value)} ${isNew ? "new" : " "} ${
        movement ? "sliding" : ""
      } ${isMerged ? "merged" : " "}`}
      style={{ ...movementStyle, fontSize: getFontSize(value) }}
    >
      {value || " "}{" "}
    </div>
  );
}

export default Tile;
