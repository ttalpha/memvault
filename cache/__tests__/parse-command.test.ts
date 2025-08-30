import { parseCommand } from "../src/parse-command";

describe("parseCommand", () => {
  test("parses GET", () => {
    expect(parseCommand("GET mykey")).toEqual({ type: "GET", key: "mykey" });
  });

  test("parses DEL", () => {
    expect(parseCommand("DEL user:1")).toEqual({
      type: "DELETE",
      key: "user:1",
    });
  });

  test("parses PING", () => {
    expect(parseCommand("PING")).toEqual({ type: "PING" });
  });

  test("parses SET with number", () => {
    expect(parseCommand("SET age 42")).toEqual({
      type: "SET",
      key: "age",
      value: 42,
      ttl: 120,
    });
  });

  test("parses SET with boolean", () => {
    expect(parseCommand("SET isAdmin true")).toEqual({
      type: "SET",
      key: "isAdmin",
      value: true,
      ttl: 120,
    });
  });

  test("parses SET with quoted string", () => {
    expect(parseCommand('SET name "Alice Smith"')).toEqual({
      type: "SET",
      key: "name",
      value: "Alice Smith",
      ttl: 120,
    });
  });

  test("parses SET with JSON object", () => {
    expect(parseCommand('SET user:1 {"id":"1","name":"User 1"} EX 60')).toEqual(
      {
        type: "SET",
        key: "user:1",
        value: { id: "1", name: "User 1" },
        ttl: 60,
      }
    );
  });

  test("parses SET with JSON array", () => {
    expect(parseCommand('SET tags ["redis","db","fast"]')).toEqual({
      type: "SET",
      key: "tags",
      value: ["redis", "db", "fast"],
      ttl: 120,
    });
  });

  test("uses default TTL when not provided", () => {
    const result = parseCommand("SET foo bar");
    expect(result.type).toBe("SET");
    expect((result as any).ttl).toBe(120);
  });

  test("caps TTL at minimum 1", () => {
    const result = parseCommand("SET foo bar EX 0");
    expect(result.type).toBe("SET");
    expect((result as any).ttl).toBe(1);
  });

  test("returns UNKNOWN for invalid command", () => {
    expect(parseCommand("HELLO WORLD")).toEqual({
      type: "UNKNOWN",
      original: "HELLO WORLD",
    });
  });
});
