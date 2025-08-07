import { describe, test, expect } from "vitest";
import utils from "./utility";

const { merge } = utils;

describe("merge()", () => {
  test("merges two 2s when moving right (2, null, 2, null)", () => {
    const arr = [2, null, 2, null];
    const { processedArr, score, movement, mergedTiles } = merge(
      arr,
      0,
      "right"
    );

    expect(processedArr).toEqual([null, null, null, 4]);
    expect(score).toBe(4);
    expect(mergedTiles).toEqual([3]);
    expect(movement).toEqual([
      { from: 0, to: 3, value: 2 },
      { from: 2, to: 3, value: 2 },
    ]);
  });

  test("handles double merge to the left (2,2,2,2)", () => {
    const arr = [2, 2, 2, 2];
    const { processedArr, score, mergedTiles } = merge(arr, 0, "left");

    expect(processedArr).toEqual([4, 4, null, null]);
    expect(score).toBe(8);
    expect(mergedTiles).toEqual([0, 1]);
  });

  test("no movement when nothing changes (2, 4, 8, 16)", () => {
    const arr = [2, 4, 8, 16];
    const { processedArr, score, movement, mergedTiles } = merge(
      arr,
      0,
      "right"
    );

    expect(processedArr).toEqual([2, 4, 8, 16]);
    expect(score).toBe(0);
    expect(movement).toEqual([]);
    expect(mergedTiles).toEqual([]);
  });

  test("up acts like left for a single line (2, null, 2, 4)", () => {
    const arr = [2, null, 2, 4];
    const { processedArr, score, mergedTiles, movement } = merge(arr, 0, "up");
    expect(processedArr).toEqual([4, 4, null, null]);
    expect(score).toBe(4);
    expect(mergedTiles).toEqual([0]);
    expect(movement).toEqual(
      expect.arrayContaining([
        { from: 0, to: 0, value: 2 },
        { from: 2, to: 0, value: 2 },
        { from: 3, to: 1, value: 4 },
      ])
    );
  });

  test("down acts like right for a single line (2, null, 2, 4)", () => {
    const arr = [2, null, 2, 4];
    const { processedArr, score, mergedTiles, movement } = merge(
      arr,
      0,
      "down"
    );
    expect(processedArr).toEqual([null, null, 4, 4]);
    expect(score).toBe(4);
    expect(mergedTiles).toEqual([2]);
    expect(movement).toEqual(
      expect.arrayContaining([
        { from: 0, to: 2, value: 2 },
        { from: 2, to: 2, value: 2 },
      ])
    );
  });

  test("merges with gaps to the left (2, null, null, 2)", () => {
    const arr = [2, null, null, 2];
    const { processedArr, score, mergedTiles, movement } = merge(
      arr,
      0,
      "left"
    );

    expect(processedArr).toEqual([4, null, null, null]);
    expect(score).toBe(4);
    expect(mergedTiles).toEqual([0]);
    expect(movement).toEqual(
      expect.arrayContaining([
        { from: 3, to: 0, value: 2 },
        { from: 0, to: 0, value: 2 },
      ])
    );
    expect(movement).toHaveLength(2);
  });

  test("merges with gaps to the right (2, null, null, 2)", () => {
    const arr = [2, null, null, 2];
    const { processedArr, score, mergedTiles, movement } = merge(
      arr,
      0,
      "right"
    );

    expect(processedArr).toEqual([null, null, null, 4]);
    expect(score).toBe(4);
    expect(mergedTiles).toEqual([3]);
    expect(movement).toEqual(
      expect.arrayContaining([
        { from: 0, to: 3, value: 2 },
        { from: 3, to: 3, value: 2 },
      ])
    );
  });

  test("merges distinct pairs correctly to the right (2, 4, 4, 8)", () => {
    const arr = [2, 4, 4, 8];
    const { processedArr, score, mergedTiles, movement } = merge(
      arr,
      0,
      "right"
    );

    expect(processedArr).toEqual([null, 2, 8, 8]);
    expect(score).toBe(8);
    expect(mergedTiles).toEqual([2]);
    expect(movement).toEqual(
      expect.arrayContaining([
        { from: 1, to: 2, value: 4 },
        { from: 0, to: 1, value: 2 },
      ])
    );
  });

  test("slides without merge to the left (null, 2, null, null)", () => {
    const arr = [null, 2, null, null];
    const { processedArr, score, mergedTiles, movement } = merge(
      arr,
      0,
      "left"
    );

    expect(processedArr).toEqual([2, null, null, null]);
    expect(score).toBe(0);
    expect(mergedTiles).toEqual([]);
    expect(movement).toEqual([{ from: 1, to: 0, value: 2 }]);
  });

  test("all nulls stay null (null, null, null, null)", () => {
    const arr = [null, null, null, null];
    const { processedArr, score, mergedTiles, movement } = merge(
      arr,
      0,
      "left"
    );

    expect(processedArr).toEqual([null, null, null, null]);
    expect(score).toBe(0);
    expect(mergedTiles).toEqual([]);
    expect(movement).toEqual([]);
  });
});
