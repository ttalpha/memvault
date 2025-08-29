import { parseValue } from "../src/parse-value";

describe("parseValue", () => {
  it("parses integers", () => {
    expect(parseValue("42")).toBe(42);
    expect(parseValue("-7")).toBe(-7);
    expect(parseValue("0005")).toBe(5); // leading zeros
  });

  it("parses floats", () => {
    expect(parseValue("3.14")).toBe(3.14);
    expect(parseValue("-0.99")).toBe(-0.99);
  });

  it("leaves non-numeric strings as strings", () => {
    expect(parseValue("42abc")).toBe("42abc");
    expect(parseValue("abc42")).toBe("abc42");
    expect(parseValue("hello world")).toBe("hello world");
  });

  it("parses JSON objects", () => {
    expect(parseValue('{"a":1,"b":"test"}')).toEqual({ a: 1, b: "test" });
  });

  it("parses JSON arrays", () => {
    expect(parseValue("[1,2,3]")).toEqual([1, 2, 3]);
  });

  it("parses nested JSON", () => {
    expect(
      parseValue('{"user":{"id":1,"name":"alice"},"tags":["a","b"]}')
    ).toEqual({
      user: { id: 1, name: "alice" },
      tags: ["a", "b"],
    });
  });

  it("parses booleans", () => {
    expect(parseValue("true")).toBe(true);
    expect(parseValue("false")).toBe(false);
  });

  it("parses null", () => {
    expect(parseValue("null")).toBe(null);
  });

  it("returns raw string if JSON is invalid", () => {
    expect(parseValue("{not valid json}")).toBe("{not valid json}");
    expect(parseValue("[1,2,")).toBe("[1,2,");
  });

  it("handles quoted strings", () => {
    expect(parseValue('"hello"')).toBe('"hello"'); // valid JSON string
    expect(parseValue("'hello'")).toBe("'hello'"); // not valid JSON → returns raw
  });
});
