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

  for (let i = 0; i < size; i++) {
    if (inputArr[i] !== null) {
      mergeArr.push(inputArr[i]);
    }
  }
  let i = mergeArr.length - 1;
  while (i > 0) {
    if (mergeArr[i] === mergeArr[i - 1]) {
      mergeArr[i] *= 2;
      score += mergeArr[i];
      mergeArr.splice(i - 1, 1);
      i--;
    }
    i--;
  }
  while (mergeArr.length < size) {
    mergeArr.unshift(null);
  }

  //dont really want to mess with the state so copies everywhere
  let processedArr = reverse ? [...mergeArr].reverse() : [...mergeArr];
  return { processedArr, score };
};

export default {
  initializeBoard,
  addRandomTile,
  checkGameOver,
  getLine,
  merge,
};
