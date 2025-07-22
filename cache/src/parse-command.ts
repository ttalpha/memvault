// --- Regex Definitions ---

// For GET <key>
// - ^GET\s+: Matches 'GET' at the start, followed by one or more whitespace.
// - (\S+): Captures the key. \S+ means one or more NON-WHITESPACE characters.
//   This ensures the key is treated as a single "word" and doesn't greedily
//   consume potential further arguments (though GET only has one).
// - \s*$: Matches optional trailing whitespace before the end of the line.
// - /i: Case-insensitive match for 'GET'.
export const VALID_GET_COMMAND = /^GET\s+(\S+)\s*$/i;

// FOR DEL <key>, similar to GET
export const VALID_DELETE_COMMAND = /^DEL\s+(\S+)\s*$/i;

// For SET <key> "<value>" [EX <ttl>]
// - ^SET\s+: Matches 'SET' at the start, followed by one or more whitespace.
// - (\S+): Captures the key (one or more non-whitespace characters).
//   Assumes key does NOT contain spaces.
// - \s+: Matches one or more whitespace separating key and value.
// - "((?:[^"\\]|\\.)*)": Captures the quoted value (JSON or plain string).
//   - " : Matches the opening double quote.
//   - ((?:[^"\\]|\\.)*) : Complex part to capture content inside quotes, handling escaped quotes/backslashes.
//   - " : Matches the closing double quote.
// - (?: ... )?: This is the optional non-capturing group for the 'EX <ttl>' part.
//   - \s+: Matches one or more whitespace before 'EX'.
//   - EX: Matches the literal 'EX' keyword (case-insensitive due to /i flag).
//   - \s+: Matches one or more whitespace after 'EX'.
//   - (\d+): Captures the TTL (one or more digits).
// - \s*$: Matches optional trailing whitespace before the end of the line.
// - /i: Case-insensitive match for 'SET' and 'EX'.
export const VALID_SET_COMMAND =
  /^SET\s+(\S+)\s+"((?:[^"\\]|\\.)*)"(?:\s+EX\s+(\d+))?\s*$/i;

export const VALID_PING_COMMAND = /^\s*PING\s*$/i;

// --- Example Usage ---

export type GetCommand = {
  type: "GET";
  key: string;
};

export type DeleteCommand = {
  type: "DELETE";
  key: string;
};

export type SetCommand = {
  type: "SET";
  key: string;
  value: string;
  ttl: number;
};

export type UnknownCommand = {
  type: "UNKNOWN";
  original: string;
};

export type PingCommand = {
  type: "PING";
};

export type Command =
  | GetCommand
  | SetCommand
  | DeleteCommand
  | UnknownCommand
  | PingCommand;

export function parseCommand(commandString: string): Command {
  let match;

  match = commandString.match(VALID_GET_COMMAND);
  if (match) {
    const key = match[1];
    return { type: "GET", key: key };
  }

  match = commandString.match(VALID_SET_COMMAND);
  if (match) {
    const key = match[1];
    const value = match[2];
    const ttl = Math.max(1, match[3] ? parseInt(match[3], 10) : 120);
    return { type: "SET", key: key, value: value, ttl: ttl };
  }

  match = commandString.match(VALID_DELETE_COMMAND);
  if (match) {
    const key = match[1];
    return { type: "DELETE", key: key };
  }

  match = commandString.match(VALID_PING_COMMAND);
  if (match) {
    return { type: "PING" };
  }

  return { type: "UNKNOWN", original: commandString };
}
