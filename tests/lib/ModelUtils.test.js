import { ModelUtils } from "../../src/lib/ModelUtils.js";

class DemoModel {
  a = "";
  b = 0;
}

describe("ModelUtils", () => {
  test("isEmpty detects empty objects", () => {
    expect(ModelUtils.isEmpty({})).toBe(true);
    expect(ModelUtils.isEmpty({ a: 1 })).toBe(false);
  });

  test("getValueOrDefault returns default only for nullish values", () => {
    expect(ModelUtils.getValueOrDefault(null, "fallback")).toBe("fallback");
    expect(ModelUtils.getValueOrDefault(undefined, "fallback")).toBe("fallback");
    expect(ModelUtils.getValueOrDefault(0, "fallback")).toBe(0);
    expect(ModelUtils.getValueOrDefault("", "fallback")).toBe("");
  });

  test("getArrayOfModels converts compatible objects into model instances", () => {
    const result = ModelUtils.getArrayOfModels(DemoModel, [{ a: "x" }, { z: 1 }, { b: 2 }]);

    expect(result).toHaveLength(2);
    expect(result[0]).toBeInstanceOf(DemoModel);
    expect(result[1]).toBeInstanceOf(DemoModel);
  });

  test("isInstanceOf validates object shape by model keys", () => {
    expect(ModelUtils.isInstanceOf(DemoModel, { a: "x", b: 2 })).toBe(true);
    expect(ModelUtils.isInstanceOf(DemoModel, { a: "x" })).toBe(false);
    expect(ModelUtils.isInstanceOf(null, { a: "x" })).toBe(false);
    expect(ModelUtils.isInstanceOf(DemoModel, null)).toBe(false);
  });
});
