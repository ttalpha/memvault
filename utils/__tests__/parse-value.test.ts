import { parseValue } from "../src/parse-value";

describe("parseValue", () => {
  test("parses numbers", () => {
    expect(parseValue("42")).toBe(42);
    expect(parseValue("0")).toBe(0);
    expect(parseValue("-15")).toBe(-15);
  });

  test("parses booleans", () => {
    expect(parseValue("true")).toBe(true);
    expect(parseValue("false")).toBe(false);
  });

  test("parses quoted strings", () => {
    expect(parseValue('"hello world"')).toBe("hello world");
    expect(parseValue('"42"')).toBe("42");
  });

  test("parses JSON objects", () => {
    const obj = { id: "1", name: "User" };
    expect(parseValue(JSON.stringify(obj))).toEqual(obj);
  });

  test("parses JSON arrays", () => {
    expect(parseValue("[1,2,3]")).toEqual([1, 2, 3]);
    expect(parseValue('["a","b"]')).toEqual(["a", "b"]);
  });

  test("returns raw string if malformed JSON", () => {
    expect(parseValue("{id:1,name:User}")).toBe("{id:1,name:User}");
  });

  test("returns fallback string if unquoted", () => {
    expect(parseValue("foo")).toBe("foo");
  });
});
