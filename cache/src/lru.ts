import DoublyLinkedList, { DoublyLinkedListNode } from "./dll";

export class LRUCache {
  private hashMap = new Map<string, DoublyLinkedListNode>();
  private dll = new DoublyLinkedList();
  private capacity: number;

  constructor(capacity = 128) {
    this.capacity = capacity;
  }

  get(key: string) {
    const node = this.hashMap.get(key);
    if (!node) return null;
    if (node.isExpired) {
      this.evict(key);
      return null;
    }
    this.dll.deleteNode(node);
    this.dll.append(node);

    return node.value;
  }

  evict(key: string) {
    const node = this.hashMap.get(key);
    if (!node) return;
    this.hashMap.delete(key);
    this.dll.deleteNode(node);
  }

  set(key: string, value: string, ttl = 120) {
    const existingNode = this.hashMap.get(key);
    if (existingNode) {
      existingNode.value = value;
      existingNode.expiresAt = Date.now() + ttl * 1000; // in seconds
      this.dll.deleteNode(existingNode);
      this.dll.append(existingNode);
      return;
    }

    const newNode = new DoublyLinkedListNode(key, value, ttl);
    const head = this.dll.head;
    if (this.hashMap.size + 1 > this.capacity && head) {
      const headKey = head.key;
      this.evict(headKey);
    }
    this.dll.append(newNode);
    this.hashMap.set(key, newNode);
  }

  delete(key: string) {
    const node = this.hashMap.get(key);
    if (!node) return;
    this.hashMap.delete(key);
    this.dll.deleteNode(node);
  }
}
