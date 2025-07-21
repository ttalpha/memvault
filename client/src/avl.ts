export class BSTNode<T> {
  key: number;
  value: T;
  left: BSTNode<T> | null;
  right: BSTNode<T> | null;

  constructor(key: number, value: T) {
    this.key = key;
    this.value = value;
    this.left = this.right = null;
  }
}

export class AVLTree<T> {
  root: BSTNode<T> | null;

  constructor() {
    this.root = null;
  }

  getHeight(root: BSTNode<T> | null = this.root): number {
    if (!root) return 0;
    if (!root.left && !root.right) return 1;
    return 1 + Math.max(this.getHeight(root.left), this.getHeight(root.right));
  }

  getNearestLargerNode(key: number, root: BSTNode<T> | null = this.root) {
    let candidate: BSTNode<T> | null = null;

    while (root !== null) {
      if (root.key > key) {
        candidate = root;
        root = root.left;
      } else {
        root = root.right;
      }
    }

    return candidate;
  }

  getMinNode(root: BSTNode<T> | null = this.root): BSTNode<T> | null {
    while (root && root.left) {
      root = root.left;
    }
    return root;
  }

  /**
   * Finds the next node in in-order traversal of a binary tree
   */
  getSuccessor(node: BSTNode<T> | null): BSTNode<T> | null {
    if (!node) return null;
    if (node.right) return this.getMinNode(node.right);

    let successor: BSTNode<T> | null = null;
    let current = this.root;

    while (current) {
      if (node.key < current.key) {
        successor = current;
        current = current.left;
      } else if (node.key > current.key) {
        current = current.right;
      } else {
        break;
      }
    }

    return successor;
  }

  getBalanceFactor(root: BSTNode<T> | null = this.root): number {
    if (!root) return 0;
    return this.getHeight(root.left) - this.getHeight(root.right);
  }

  private rotateLeft(root: BSTNode<T>): BSTNode<T> | null {
    const right = root.right;
    if (!right) return null;

    const rightLeft = right.left;
    right.left = root;
    root.right = rightLeft;
    return right;
  }

  private rotateRight(root: BSTNode<T>): BSTNode<T> | null {
    const left = root.left;
    if (!left) return null;

    const leftRight = left.right;
    left.right = root;
    root.left = leftRight;
    return left;
  }

  get(key: number): BSTNode<T> | null {
    return this.getNode(key, this.root);
  }

  private getNode(key: number, root: BSTNode<T> | null): BSTNode<T> | null {
    if (!root) return null;
    if (root.key === key) return root;
    if (root.key > key) return this.getNode(key, root.left);
    return this.getNode(key, root.right);
  }

  set(key: number, value: T): void {
    this.root = this.setNode(key, value, this.root);
  }

  private setNode(key: number, value: T, root: BSTNode<T> | null): BSTNode<T> {
    if (!root) return new BSTNode(key, value);

    if (root.key === key) {
      root.value = value;
    } else if (root.key > key) {
      root.left = this.setNode(key, value, root.left);
    } else {
      root.right = this.setNode(key, value, root.right);
    }

    return this.balanceAfterSet(key, root);
  }

  private balanceAfterSet(key: number, root: BSTNode<T>): BSTNode<T> {
    const balanceFactor = this.getBalanceFactor(root);

    if (balanceFactor > 1) {
      if (!root.left) return root;

      if (key < root.left.key) {
        return this.rotateRight(root) || root;
      }
      if (key > root.left.key) {
        root.left = this.rotateLeft(root.left) || root.left;
        return this.rotateRight(root) || root;
      }
    } else if (balanceFactor < -1) {
      if (!root.right) return root;

      if (key > root.right.key) {
        return this.rotateLeft(root) || root;
      }
      if (key < root.right.key) {
        root.right = this.rotateRight(root.right) || root.right;
        return this.rotateLeft(root) || root;
      }
    }

    return root;
  }

  private balanceAfterDelete(root: BSTNode<T>): BSTNode<T> {
    const balanceFactor = this.getBalanceFactor(root);

    if (balanceFactor > 1) {
      if (!root.left) return root;

      const leftBalanceFactor = this.getBalanceFactor(root.left);

      if (leftBalanceFactor >= 0) {
        return this.rotateRight(root) || root;
      } else {
        root.left = this.rotateLeft(root.left) || root.left;
        return this.rotateRight(root) || root;
      }
    } else if (balanceFactor < -1) {
      if (!root.right) return root;

      const rightBalanceFactor = this.getBalanceFactor(root.right);

      if (rightBalanceFactor <= 0) {
        return this.rotateLeft(root) || root;
      } else {
        root.right = this.rotateRight(root.right) || root.right;
        return this.rotateLeft(root) || root;
      }
    }

    return root;
  }

  delete(key: number): void {
    this.root = this.deleteNode(key, this.root);
  }

  private deleteNode(key: number, root: BSTNode<T> | null): BSTNode<T> | null {
    if (!root) return null;

    if (root.key > key) {
      root.left = this.deleteNode(key, root.left);
    } else if (root.key < key) {
      root.right = this.deleteNode(key, root.right);
    } else {
      if (!root.right) return root.left;

      if (!root.left) return root.right;

      const minNode = this.findMinNode(root.right);
      if (!minNode) return root;

      root.key = minNode.key;
      root.value = minNode.value;
      root.right = this.deleteNode(minNode.key, root.right);
    }

    return this.balanceAfterDelete(root);
  }

  private findMinNode(root: BSTNode<T> | null): BSTNode<T> | null {
    while (root && root.left) {
      root = root.left;
    }
    return root;
  }

  isBalanced(root: BSTNode<T> | null = this.root): boolean {
    if (!root) return true;

    const balanceFactor = this.getBalanceFactor(root);
    if (Math.abs(balanceFactor) > 1) return false;

    return this.isBalanced(root.left) && this.isBalanced(root.right);
  }

  isBST(
    root: BSTNode<T> | null = this.root,
    min: number = Number.MIN_SAFE_INTEGER,
    max: number = Number.MAX_SAFE_INTEGER
  ): boolean {
    if (!root) return true;

    if (root.key <= min || root.key >= max) return false;

    return (
      this.isBST(root.left, min, root.key) &&
      this.isBST(root.right, root.key, max)
    );
  }

  inorderTraversal(): number[] {
    const result: number[] = [];

    const traverse = (node: BSTNode<T> | null) => {
      if (!node) return;
      traverse(node.left);
      result.push(node.key);
      traverse(node.right);
    };

    traverse(this.root);
    return result;
  }

  isEmpty(): boolean {
    return this.root === null;
  }

  size(): number {
    const countNodes = (node: BSTNode<T> | null): number => {
      if (!node) return 0;
      return 1 + countNodes(node.left) + countNodes(node.right);
    };

    return countNodes(this.root);
  }

  findMin(): number | null {
    const minNode = this.findMinNode(this.root);
    return minNode ? minNode.key : null;
  }

  findMax(): number | null {
    let current = this.root;
    while (current && current.right) {
      current = current.right;
    }
    return current ? current.key : null;
  }

  clear(): void {
    this.root = null;
  }

  toString(): string {
    if (!this.root) return "Empty tree";

    const lines: string[] = [];
    const traverse = (
      node: BSTNode<T> | null,
      prefix: string = "",
      isLeft: boolean = true
    ) => {
      if (!node) return;

      if (node.right) {
        traverse(node.right, prefix + (isLeft ? "│   " : "    "), false);
      }

      lines.push(prefix + (isLeft ? "└── " : "┌── ") + node.key);

      if (node.left) {
        traverse(node.left, prefix + (isLeft ? "    " : "│   "), true);
      }
    };

    traverse(this.root, "", true);
    return lines.join("\n");
  }
}
