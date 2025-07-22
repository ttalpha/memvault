import DoublyLinkedList, { DoublyLinkedListNode } from "../src/dll";

jest.useFakeTimers();

describe("DoublyLinkedList", () => {
  it("should append nodes and maintain head/tail", () => {
    const dll = new DoublyLinkedList();
    const node1 = new DoublyLinkedListNode("a", "1", 10);
    const node2 = new DoublyLinkedListNode("b", "2", 10);

    dll.append(node1);
    expect(dll.head).toBe(node1);
    expect(dll.tail).toBe(node1);

    dll.append(node2);
    expect(dll.head).toBe(node1);
    expect(dll.tail).toBe(node2);
    expect(node1.next).toBe(node2);
    expect(node2.prev).toBe(node1);
  });

  it("should delete nodes and update head/tail", () => {
    const dll = new DoublyLinkedList();
    const node1 = new DoublyLinkedListNode("a", "1", 10);
    const node2 = new DoublyLinkedListNode("b", "2", 10);
    const node3 = new DoublyLinkedListNode("c", "3", 10);

    dll.append(node1);
    dll.append(node2);
    dll.append(node3);

    dll.deleteNode(node2);
    expect(node1.next).toBe(node3);
    expect(node3.prev).toBe(node1);

    dll.deleteNode(node1);
    expect(dll.head).toBe(node3);
    expect(node3.prev).toBeNull();

    dll.deleteNode(node3);
    expect(dll.head).toBeNull();
    expect(dll.tail).toBeNull();
  });

  it("should check node expiration", () => {
    const node = new DoublyLinkedListNode("x", "y", 5); // expires immediately
    jest.advanceTimersByTime(5001);
    expect(node.isExpired).toBe(true);

    const node2 = new DoublyLinkedListNode("x", "y", 100);
    expect(node2.isExpired).toBe(false);
  });

  it("should return correct string representation", () => {
    const dll = new DoublyLinkedList();
    dll.append(new DoublyLinkedListNode("a", "1", 10));
    dll.append(new DoublyLinkedListNode("b", "2", 10));
    const str = dll.toString();
    expect(str).toContain("a: 1");
    expect(str).toContain("b: 2");
  });

  it("should handle multiple appends, moves, and deletes correctly", () => {
    const dll = new DoublyLinkedList();
    const nodes = Array.from(
      { length: 5 },
      (_, i) => new DoublyLinkedListNode(`k${i}`, `v${i}`, 100)
    );
    nodes.forEach((node) => dll.append(node));
    expect(dll.head).toBe(nodes[0]);
    expect(dll.tail).toBe(nodes[4]);

    dll.deleteNode(nodes[2]);
    dll.append(nodes[2]);
    expect(dll.tail).toBe(nodes[2]);
    expect(dll.head).toBe(nodes[0]);

    dll.deleteNode(nodes[0]);
    expect(dll.head).toBe(nodes[1]);
    expect(dll.head?.prev).toBeNull();

    dll.deleteNode(nodes[2]);
    expect(dll.tail).toBe(nodes[4]);

    dll.deleteNode(nodes[1]);
    dll.deleteNode(nodes[3]);
    dll.deleteNode(nodes[4]);
    expect(dll.head).toBeNull();
    expect(dll.tail).toBeNull();
  });

  it("should efficiently handle many appends and deletes (performance)", () => {
    const dll = new DoublyLinkedList();
    const N = 10000;
    const nodes = [];
    for (let i = 0; i < N; i++) {
      const node = new DoublyLinkedListNode(`k${i}`, `v${i}`, 100);
      dll.append(node);
      nodes.push(node);
    }
    expect(dll.head).toBe(nodes[0]);
    expect(dll.tail).toBe(nodes[N - 1]);

    // Delete all nodes
    for (let i = 0; i < N; i++) {
      dll.deleteNode(nodes[i]);
    }
    expect(dll.head).toBeNull();
    expect(dll.tail).toBeNull();
  });
});
