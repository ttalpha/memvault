import { parseCommand } from "../src/parse-command";

describe("parseCommand", () => {
  // ---------------- GET ----------------
  it("parses GET", () => {
    expect(parseCommand("GET mykey")).toEqual({ type: "GET", key: "mykey" });
  });

  it("GET is case-insensitive", () => {
    expect(parseCommand("get mykey")).toEqual({ type: "GET", key: "mykey" });
  });

  // ---------------- SET (unquoted) ----------------
  it("parses SET with unquoted number", () => {
    expect(parseCommand("SET mykey 123")).toEqual({
      type: "SET",
      key: "mykey",
      value: 123, // parsed as number
      ttl: 120,
    });
  });

  it("parses SET with unquoted boolean", () => {
    expect(parseCommand("SET mykey true")).toEqual({
      type: "SET",
      key: "mykey",
      value: true,
      ttl: 120,
    });
  });

  it("parses SET with unquoted JSON", () => {
    expect(parseCommand('SET profile {"id":1,"name":"bob"} EX 30')).toEqual({
      type: "SET",
      key: "profile",
      value: { id: 1, name: "bob" },
      ttl: 30,
    });
  });

  it("forces TTL minimum of 1", () => {
    expect(parseCommand("SET mykey 5 EX 0")).toEqual({
      type: "SET",
      key: "mykey",
      value: 5,
      ttl: 1,
    });
  });

  // ---------------- SET (quoted) ----------------
  it("parses SET with quoted string", () => {
    expect(parseCommand('SET mykey "hello"')).toEqual({
      type: "SET",
      key: "mykey",
      value: "hello", // always string
      ttl: 120,
    });
  });

  it("quoted numeric stays string", () => {
    expect(parseCommand('SET mykey "42"')).toEqual({
      type: "SET",
      key: "mykey",
      value: "42",
      ttl: 120,
    });
  });

  it("quoted boolean stays string", () => {
    expect(parseCommand('SET mykey "true"')).toEqual({
      type: "SET",
      key: "mykey",
      value: "true",
      ttl: 120,
    });
  });

  it("quoted JSON stays string", () => {
    expect(parseCommand('SET mykey "{\\"id\\":1}"')).toEqual({
      type: "SET",
      key: "mykey",
      value: '{\\"id\\":1}',
      ttl: 120,
    });
  });

  // ---------------- DEL ----------------
  it("parses DEL", () => {
    expect(parseCommand("DEL mykey")).toEqual({ type: "DELETE", key: "mykey" });
  });

  it("DEL is case-insensitive", () => {
    expect(parseCommand("del anotherKey")).toEqual({
      type: "DELETE",
      key: "anotherKey",
    });
  });

  // ---------------- PING ----------------
  it("parses PING", () => {
    expect(parseCommand("PING")).toEqual({ type: "PING" });
  });

  it("PING with extra spaces", () => {
    expect(parseCommand("   PING   ")).toEqual({ type: "PING" });
  });

  // ---------------- UNKNOWN ----------------
  it("returns UNKNOWN for invalid command", () => {
    expect(parseCommand("RANDOMCMD key")).toEqual({
      type: "UNKNOWN",
      original: "RANDOMCMD key",
    });
  });

  it("handles empty input", () => {
    expect(parseCommand("")).toEqual({ type: "UNKNOWN", original: "" });
    expect(parseCommand("   ")).toEqual({ type: "UNKNOWN", original: "   " });
  });

  // ---------------- Edge cases ----------------
  it("handles weird spacing in SET", () => {
    expect(parseCommand('SET spacedKey "spaced   value" EX 5')).toEqual({
      type: "SET",
      key: "spacedKey",
      value: "spaced   value",
      ttl: 5,
    });
  });

  it("fails gracefully on malformed SET", () => {
    expect(parseCommand("SET mykey")).toEqual({
      type: "UNKNOWN",
      original: "SET mykey",
    });
  });
});
