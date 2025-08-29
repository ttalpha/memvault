export class DoublyLinkedListNode {
  key: string;
  value: string;
  expiresAt?: number;
  prev: DoublyLinkedListNode | null;
  next: DoublyLinkedListNode | null;

  constructor(key: string, value: string, ttl?: number) {
    this.key = key;
    this.value = value;
    if (ttl) this.expiresAt = Date.now() + ttl * 1000;
    this.prev = null;
    this.next = null;
  }

  get isExpired() {
    if (!this.expiresAt) return false;
    return Date.now() > this.expiresAt;
  }
}

export default class DoublyLinkedList {
  head: DoublyLinkedListNode | null;
  tail: DoublyLinkedListNode | null;

  constructor() {
    this.head = null;
    this.tail = null;
  }

  append(newNode: DoublyLinkedListNode) {
    if (!this.head || !this.tail) {
      this.head = newNode;
      this.tail = this.head;
      return;
    }

    this.tail.next = newNode;
    newNode.prev = this.tail;
    this.tail = newNode;
  }

  deleteNode(node: DoublyLinkedListNode) {
    if (node.prev) node.prev.next = node.next;
    if (node.next) node.next.prev = node.prev;
    if (node.key === this.head?.key) this.head = node.next;
    if (node.key === this.tail?.key) this.tail = node.prev;
    node.prev = null;
    node.next = null;
  }

  toString(): string {
    let dll = "{";
    for (let cur = this.head; cur != null; cur = cur.next) {
      dll += `\n  ${cur.key}: ${cur.value}`;
    }
    dll += "\n}";
    return dll;
  }
}
