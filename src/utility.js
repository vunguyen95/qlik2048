//utility function for the 2048 game

export const initializeBoard = () => {
  //return a 4x4 null array
  const newBoard = Array(4)
    .fill(null)
    .map(() => Array(4).fill(null));
  return newBoard;
};
export const addRandomTile = (board) => {
  // modify in-place the board, return a board with a random tile
  // 90% 2, 10% 4
  // for animation, return the position of the new tile
  let emptyTiles = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === null) {
        emptyTiles.push({ r, c });
      }
    }
  }
  if (emptyTiles.length > 0) {
    const randomTile =
      emptyTiles[Math.floor(Math.random() * emptyTiles.length)]; //select random index
    board[randomTile.r][randomTile.c] = Math.random() < 0.9 ? 2 : 4;
    //return positions for newTile.
    return { row: randomTile.r, col: randomTile.c };
  }
  return null;
};
export const checkGameOver = (board) => {
  // return 1 if no more move is possible.
  return false;
};

export const getLine = (board, idx, isRow) => {
  if (isRow) {
    return [...board[idx]];
  } else {
    return board.map((row) => row[idx]);
  }
};

export const merge = (arr, score, direction) => {
  // Only 1 logic for the right direction, the rest is done through input arr manipulation
  // left: row reverse
  // up + down: column, and reverse column for up
  const size = arr.length;
  const reverse = direction === "left" || direction === "up";
  let inputArr = reverse ? [...arr].reverse() : [...arr]; //Maybe shallow copy is OK? idk
  let mergeArr = [];
  let movement = [];

  for (let i = 0; i < size; i++) {
    if (inputArr[i] !== null) {
      mergeArr.push({
        value: inputArr[i],
        originalIndex: i,
        merged: false,
        from: [i],
      });
    }
  }

  /*
  //merge pass
  let i = mergeArr.length - 1;
  let target = reverse ? 0 : size - 1;
  while (i > 0) {
    if (
      mergeArr[i].value != null &&
      mergeArr[i].value === mergeArr[i - 1].value
    ) {
      mergeArr[i].value *= 2;
      score += mergeArr[i].value;
      mergeArr[i].merged = true;
      mergeArr[i].from = [
        mergeArr[i - 1].originalIndex,
        mergeArr[i].originalIndex,
      ];

      mergeArr.splice(i - 1, 1);
      i--;
    }
    i--;
  }
*/
  for (let i = mergeArr.length - 1; i > 0; i--) {
    if (mergeArr[i].value === mergeArr[i - 1].value) {
      mergeArr[i].value *= 2;
      score += mergeArr[i].value;
      mergeArr[i].merged = true;
      mergeArr[i].from = [
        mergeArr[i - 1].originalIndex,
        mergeArr[i].originalIndex,
      ];
      mergeArr.splice(i - 1, 1);
      i--; //After a merge, we need to skip the next element
    }
  }

  //construct final array and movement

  let finalArr = Array(size).fill(null);
  let currentPos = size - 1;
  let mergedTiles = [];
  for (let i = mergeArr.length - 1; i >= 0; i--) {
    let tile = mergeArr[i];
    finalArr[currentPos] = tile.value;

    const to = reverse ? size - 1 - currentPos : currentPos;
    if (tile.merged) {
      mergedTiles.push(to);
      const from1 = reverse ? size - 1 - tile.from[0] : tile.from[0];
      const from2 = reverse ? size - 1 - tile.from[1] : tile.from[1];
      movement.push({ from: from1, to: to, value: tile.value / 2 });
      movement.push({ from: from2, to: to, value: tile.value / 2 });
    } else {
      const from = reverse ? size - 1 - tile.from[0] : tile.from[0];
      if (from !== to) {
        movement.push({ from: from, to: to, value: tile.value });
      }
    }
    currentPos--;
  }
  let processedArr = reverse ? [...finalArr].reverse() : finalArr;
  return { processedArr, score, movement, mergedTiles };
};
/*
export const merge = (arr, score, direction) => {
  const length = arr.length;
  // Reverse for left/up moves
  const reverse = direction === "left" || direction === "up";
  let line = reverse ? [...arr].reverse() : [...arr];

  let movement = [];

  // 1. Filter out nulls, keeping original index
  let nonNull = [];
  for (let i = 0; i < length; i++) {
    if (line[i] !== null) {
      nonNull.push({
        value: line[i],
        originalIndex: i,
        merged: false,
        from: [i],
      });
    }
  }

  // 2. Merge pass
  if (nonNull.length > 1) {
    for (let i = nonNull.length - 1; i > 0; i--) {
      if (nonNull[i].value === nonNull[i - 1].value) {
        nonNull[i].value *= 2;
        score += nonNull[i].value;
        nonNull[i].merged = true;
        nonNull[i].from = [
          nonNull[i - 1].originalIndex,
          nonNull[i].originalIndex,
        ];

        nonNull.splice(i - 1, 1);
        i--; // Decrement i to skip the next element as we have processed two
      }
    }
  }
  console.log(nonNull);
  // 3. Construct final line and movement array
  let finalArr = Array(length).fill(null);
  let currentPos = length - 1;
  let mergedTiles = [];

  for (let i = nonNull.length - 1; i >= 0; i--) {
    let tile = nonNull[i];
    finalArr[currentPos] = tile.value;
    const to = reverse ? length - 1 - currentPos : currentPos;

    if (tile.merged) {
      const from1 = reverse ? length - 1 - tile.from[0] : tile.from[0];
      const from2 = reverse ? length - 1 - tile.from[1] : tile.from[1];

      movement.push({ from: from1, to: to, value: tile.value / 2 });
      movement.push({ from: from2, to: to, value: tile.value / 2 });
      mergedTiles.push(to);
    } else {
      const from = reverse ? length - 1 - tile.from[0] : tile.from[0];
      if (from !== to) {
        movement.push({ from: from, to: to, value: tile.value });
      }
    }

    currentPos--;
  }

  let processedArr = reverse ? [...finalArr].reverse() : finalArr;
  // The 'movement' array now contains distinct movements for each tile.
  // For a merge, it will contain two movements to the same target square.
  // The UI can then use this to show sliding animations,
  // and after they complete, it can show a merge animation at the target square.
  // The `merged` property is no longer needed in the movement object itself.

  return { processedArr, score, movement, mergedTiles };
}; */

export default {
  initializeBoard,
  addRandomTile,
  checkGameOver,
  getLine,
  merge,
  //mergeTest,
};
