import { parseValue } from "memvault-utils";

export const VALID_GET_COMMAND = /^GET\s+(\S+)\s*$/i;
export const VALID_DELETE_COMMAND = /^DEL\s+(\S+)\s*$/i;

// SET key "string value" [EX ttl] OR SET key rawValue [EX ttl]
export const VALID_SET_COMMAND =
  /^SET\s+(\S+)\s+("[^"]*"|\{.*\}|\[.*\]|true|false|\S+)(?:\s+EX\s+(\d+))?\s*$/i;

export const VALID_PING_COMMAND = /^\s*PING\s*$/i;

export type GetCommand = { type: "GET"; key: string };
export type DeleteCommand = { type: "DELETE"; key: string };
export type SetCommand = { type: "SET"; key: string; value: any; ttl: number };
export type PingCommand = { type: "PING" };
export type UnknownCommand = { type: "UNKNOWN"; original: string };

export type Command =
  | GetCommand
  | SetCommand
  | DeleteCommand
  | PingCommand
  | UnknownCommand;

export function parseCommand(commandString: string): Command {
  let match;

  // GET
  match = commandString.match(VALID_GET_COMMAND);
  if (match) {
    return { type: "GET", key: match[1] };
  }

  // SET
  match = commandString.match(VALID_SET_COMMAND);
  if (match) {
    const key = match[1];
    const raw = match[2];
    const ttl = Math.max(1, match[3] ? parseInt(match[3], 10) : 120);

    let value: any;

    if (raw.startsWith('"') && raw.endsWith('"')) {
      // quoted value = always string
      value = raw.slice(1, -1);
    } else {
      // unquoted → run parseValue
      value = parseValue(raw);
    }

    return { type: "SET", key, value, ttl };
  }

  // DEL
  match = commandString.match(VALID_DELETE_COMMAND);
  if (match) {
    return { type: "DELETE", key: match[1] };
  }

  // PING
  match = commandString.match(VALID_PING_COMMAND);
  if (match) {
    return { type: "PING" };
  }

  return { type: "UNKNOWN", original: commandString };
}
