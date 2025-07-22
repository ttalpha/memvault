import { LRUCache } from "../src/lru";

jest.useFakeTimers();

describe("LRUCache", () => {
  it("should set and get values", () => {
    const lru = new LRUCache(2);
    lru.set("a", "1", 10);
    lru.set("b", "2", 10);

    expect(lru.get("a")).toBe("1");
    expect(lru.get("b")).toBe("2");
  });

  it("should evict least recently used when over capacity", () => {
    const lru = new LRUCache(2);
    lru.set("a", "1", 10);
    lru.set("b", "2", 10);
    lru.set("c", "3", 10); // should evict "a"

    expect(lru.get("a")).toBeNull();
    expect(lru.get("b")).toBe("2");
    expect(lru.get("c")).toBe("3");
  });

  it("should update value and move node to tail on set", () => {
    const lru = new LRUCache(2);
    lru.set("a", "1", 10);
    lru.set("b", "2", 10);
    lru.set("a", "updated", 10);

    expect(lru.get("a")).toBe("updated");
    lru.set("c", "3", 10); // should evict "b"
    expect(lru.get("b")).toBeNull();
    expect(lru.get("a")).toBe("updated");
    expect(lru.get("c")).toBe("3");
  });

  it("should delete keys", () => {
    const lru = new LRUCache(2);
    lru.set("a", "1", 10);
    lru.set("b", "2", 10);

    lru.delete("a");
    expect(lru.get("a")).toBeNull();
    expect(lru.get("b")).toBe("2");
  });

  it("should evict expired keys on get", async () => {
    const lru = new LRUCache(2);
    lru.set("a", "1", 5); // expires immediately
    jest.advanceTimersByTime(5001);
    lru.set("b", "2", 10);

    expect(lru.get("a")).toBeNull();
    expect(lru.get("b")).toBe("2");
  });

  it("should handle interleaved get and set operations", () => {
    const lru = new LRUCache(2);
    lru.set("a", "1", 10);
    expect(lru.get("a")).toBe("1"); // access "a"
    lru.set("b", "2", 10);
    expect(lru.get("b")).toBe("2"); // access "b"
    lru.set("c", "3", 10); // should evict "a" (least recently used)
    expect(lru.get("a")).toBeNull();
    expect(lru.get("b")).toBe("2");
    expect(lru.get("c")).toBe("3");
    lru.get("b"); // access "b"
    lru.set("d", "4", 10); // should evict "c"
    expect(lru.get("c")).toBeNull();
    expect(lru.get("b")).toBe("2");
    expect(lru.get("d")).toBe("4");
  });

  it("should update recently used key and evict the correct one", () => {
    const lru = new LRUCache(2);
    lru.set("x", "100", 10);
    lru.set("y", "200", 10);
    lru.get("x"); // "x" becomes most recently used
    lru.set("z", "300", 10); // should evict "y"
    expect(lru.get("y")).toBeNull();
  });

  it("should handle a sequence of random get and set operations", () => {
    const lru = new LRUCache(100);
    const keys = Array.from({ length: 100 }, (_, i) => `key${i}`);
    const values = Array.from({ length: 100 }, (_, i) => `val${i}`);

    for (let i = 0; i < 100; i++) {
      lru.set(keys[i], values[i], 100);
    }

    for (let i = 0; i < 10000; i++) {
      const op = Math.random() < 0.5 ? "get" : "set";
      const idx = Math.floor(Math.random() * keys.length);
      if (op === "get") {
        // Just call get, ignore result
        lru.get(keys[idx]);
      } else {
        lru.set(keys[idx], values[idx], 100);
      }
    }

    let count = 0;
    for (const key of keys) {
      if (lru.get(key) !== null) count++;
    }
    expect(count).toBeLessThanOrEqual(100);
  });
});
