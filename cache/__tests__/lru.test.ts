import { LRUCache } from "../src/lru";

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
    lru.set("a", "1", 0); // expires immediately
    lru.set("b", "2", 10);

    expect(lru.get("a")).toBeNull();
    expect(lru.get("b")).toBe("2");
  });
});
