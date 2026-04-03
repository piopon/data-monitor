import test from "node:test";
import assert from "node:assert/strict";

import { DataUtils } from "../../src/lib/DataUtils.js";

test("DataUtils.nameToId converts spaces to hyphens and lowercases text", () => {
  assert.equal(DataUtils.nameToId("Hello World"), "hello-world");
});

test("DataUtils.nameToId collapses repeated spaces into single hyphen", () => {
  assert.equal(DataUtils.nameToId("A   B   C"), "a-b-c");
});

test("DataUtils.nameToId leaves existing hyphens in place", () => {
  assert.equal(DataUtils.nameToId("Already-Slugged"), "already-slugged");
});
