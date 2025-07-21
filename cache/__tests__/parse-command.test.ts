import { parseCommand } from "../src/parse-command";

describe("parseCommand", () => {
  it("parses GET command", () => {
    expect(parseCommand("GET myKey")).toEqual({ type: "GET", key: "myKey" });
    expect(parseCommand("get myKey")).toEqual({ type: "GET", key: "myKey" });
    expect(parseCommand("GET   anotherKey   ")).toEqual({
      type: "GET",
      key: "anotherKey",
    });
  });

  it("parses DEL command", () => {
    expect(parseCommand("DEL myKey")).toEqual({ type: "DELETE", key: "myKey" });
    expect(parseCommand("del myKey")).toEqual({ type: "DELETE", key: "myKey" });
    expect(parseCommand("DEL   anotherKey   ")).toEqual({
      type: "DELETE",
      key: "anotherKey",
    });
  });

  it("parses SET command with value and default TTL", () => {
    expect(parseCommand('SET myKey "myValue"')).toEqual({
      type: "SET",
      key: "myKey",
      value: "myValue",
      ttl: 120,
    });
    expect(parseCommand('set myKey "myValue"')).toEqual({
      type: "SET",
      key: "myKey",
      value: "myValue",
      ttl: 120,
    });
    expect(parseCommand('SET myKey "myValue"   ')).toEqual({
      type: "SET",
      key: "myKey",
      value: "myValue",
      ttl: 120,
    });
  });

  it("parses SET command with value and explicit TTL", () => {
    expect(parseCommand('SET myKey "myValue" EX 99')).toEqual({
      type: "SET",
      key: "myKey",
      value: "myValue",
      ttl: 99,
    });
    expect(parseCommand('SET myKey "myValue" EX 0')).toEqual({
      type: "SET",
      key: "myKey",
      value: "myValue",
      ttl: 1, // minimum TTL is 1
    });
    expect(parseCommand('SET myKey "myValue" ex 77')).toEqual({
      type: "SET",
      key: "myKey",
      value: "myValue",
      ttl: 77,
    });
  });

  it("parses SET command with quoted value containing escaped quotes", () => {
    expect(parseCommand('SET k "value with \\"quotes\\""')).toEqual({
      type: "SET",
      key: "k",
      value: 'value with \\"quotes\\"',
      ttl: 120,
    });
    expect(parseCommand('SET k "escaped \\\\ backslash"')).toEqual({
      type: "SET",
      key: "k",
      value: "escaped \\\\ backslash",
      ttl: 120,
    });
  });

  it("returns UNKNOWN for invalid commands", () => {
    expect(parseCommand("UNKNOWNCMD")).toEqual({
      type: "UNKNOWN",
      original: "UNKNOWNCMD",
    });
    expect(parseCommand("SET myKey myValue")).toEqual({
      type: "UNKNOWN",
      original: "SET myKey myValue",
    });
    expect(parseCommand("GET")).toEqual({
      type: "UNKNOWN",
      original: "GET",
    });
    expect(parseCommand("DEL")).toEqual({
      type: "UNKNOWN",
      original: "DEL",
    });
    expect(parseCommand("SET")).toEqual({
      type: "UNKNOWN",
      original: "SET",
    });
    expect(parseCommand("")).toEqual({
      type: "UNKNOWN",
      original: "",
    });
  });

  it("does not match keys with spaces", () => {
    expect(parseCommand('GET "key with spaces"')).toEqual({
      type: "UNKNOWN",
      original: 'GET "key with spaces"',
    });
    expect(parseCommand('SET "key with spaces" "value"')).toEqual({
      type: "UNKNOWN",
      original: 'SET "key with spaces" "value"',
    });
  });
});
