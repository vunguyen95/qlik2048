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

  const getFontSize = () => {
    if (!value) return {};
    const numDigits = value.toString().length;
    if (numDigits <= 2) return "40px";
    if (numDigits > 2) return `${40 - (numDigits - 2) * 5}px`;
  };
  const getMovementStyle = () => {
    if (!movement) return {};

    const tileWidth = 70; // slightly smaller, better animation (wont slide out).
    const tileHeight = 75;
    const gap = 10;
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
