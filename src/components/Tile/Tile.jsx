import React from "react";

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

export default Tile;
