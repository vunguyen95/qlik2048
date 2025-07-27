const merge = (arr, direction) => {
  // Only 1 logic for the right direction, the rest is done through input arr manipulation
  // left: row reverse
  // up + down: column, and reverse column for up
  const size = arr.length;
  const reverse = direction === "left" || direction === "up";
  console.log("reverse ", reverse);
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
  console.log("mergeArr after filter", mergeArr);

  for (let i = mergeArr.length - 1; i > 0; i--) {
    if (mergeArr[i].value === mergeArr[i - 1].value) {
      mergeArr[i].value *= 2;
      mergeArr[i].merged = true;
      mergeArr[i].from = [
        mergeArr[i - 1].originalIndex,
        mergeArr[i].originalIndex,
      ];
      mergeArr.splice(i - 1, 1);
      i--; //After a merge, we need to skip the next element
    }
  }
  console.log("mergeArr after merge", mergeArr);
  //construct final array and movement

  let finalArr = Array(size).fill(null);
  let currentPos = size - 1;
  console.log("current position ", currentPos);
  let mergedTiles = [];
  for (let i = mergeArr.length - 1; i >= 0; i--) {
    let tile = mergeArr[i];
    finalArr[currentPos] = tile.value;

    const to = reverse ? size - 1 - currentPos : currentPos;
    console.log("to ", to);
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

  console.log("mergedTiles ", mergedTiles);
  let processedArr = reverse ? [...finalArr].reverse() : finalArr;
  console.log("processedArr ", processedArr);
  return { processedArr, movement, mergedTiles };
};

console.log(merge([4, 4, null, 2], "right"));
