import { DataUtils } from "../../src/lib/DataUtils.js";

test("DataUtils.nameToId converts spaces to hyphens and lowercases text", () => {
  expect(DataUtils.nameToId("Hello World")).toBe("hello-world");
});

test("DataUtils.nameToId collapses repeated spaces into single hyphen", () => {
  expect(DataUtils.nameToId("A   B   C")).toBe("a-b-c");
});

test("DataUtils.nameToId leaves existing hyphens in place", () => {
  expect(DataUtils.nameToId("Already-Slugged")).toBe("already-slugged");
});
