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
      if (root.key === key) return root;
      else if (root.key > key) {
        candidate = root; // This is a potential candidate
        root = root.left; // Try to find a closer one on the left
      } else {
        root = root.right; // Go right to find larger keys
      }
    }

    return candidate;
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

  // Public get method
  get(key: number): BSTNode<T> | null {
    return this.getNode(key, this.root);
  }

  // Private recursive get method
  private getNode(key: number, root: BSTNode<T> | null): BSTNode<T> | null {
    if (!root) return null;
    if (root.key === key) return root;
    if (root.key > key) return this.getNode(key, root.left);
    return this.getNode(key, root.right);
  }

  // Public set method
  set(key: number, value: T): void {
    this.root = this.setNode(key, value, this.root);
  }

  // Private recursive set method
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

    // Left heavy
    if (balanceFactor > 1) {
      if (!root.left) return root;

      // Left-Left case
      if (key < root.left.key) {
        return this.rotateRight(root) || root;
      }
      // Left-Right case
      if (key > root.left.key) {
        root.left = this.rotateLeft(root.left) || root.left;
        return this.rotateRight(root) || root;
      }
    }
    // Right heavy
    else if (balanceFactor < -1) {
      if (!root.right) return root;

      // Right-Right case
      if (key > root.right.key) {
        return this.rotateLeft(root) || root;
      }
      // Right-Left case
      if (key < root.right.key) {
        root.right = this.rotateRight(root.right) || root.right;
        return this.rotateLeft(root) || root;
      }
    }

    return root;
  }

  private balanceAfterDelete(root: BSTNode<T>): BSTNode<T> {
    const balanceFactor = this.getBalanceFactor(root);

    // Left heavy
    if (balanceFactor > 1) {
      if (!root.left) return root;

      const leftBalanceFactor = this.getBalanceFactor(root.left);

      // Left-Left case
      if (leftBalanceFactor >= 0) {
        return this.rotateRight(root) || root;
      }
      // Left-Right case
      else {
        root.left = this.rotateLeft(root.left) || root.left;
        return this.rotateRight(root) || root;
      }
    }
    // Right heavy
    else if (balanceFactor < -1) {
      if (!root.right) return root;

      const rightBalanceFactor = this.getBalanceFactor(root.right);

      // Right-Right case (FIXED: was rotateRight, now rotateLeft)
      if (rightBalanceFactor <= 0) {
        return this.rotateLeft(root) || root;
      }
      // Right-Left case
      else {
        root.right = this.rotateRight(root.right) || root.right;
        return this.rotateLeft(root) || root;
      }
    }

    return root;
  }

  // Public delete method
  delete(key: number): void {
    this.root = this.deleteNode(key, this.root);
  }

  // Private recursive delete method
  private deleteNode(key: number, root: BSTNode<T> | null): BSTNode<T> | null {
    if (!root) return null;

    if (root.key > key) {
      root.left = this.deleteNode(key, root.left);
    } else if (root.key < key) {
      root.right = this.deleteNode(key, root.right);
    } else {
      // Node to be deleted found

      // Case 1: Node has no right child
      if (!root.right) return root.left;

      // Case 2: Node has no left child
      if (!root.left) return root.right;

      // Case 3: Node has both children
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

  // Utility method to check if tree is balanced
  isBalanced(root: BSTNode<T> | null = this.root): boolean {
    if (!root) return true;

    const balanceFactor = this.getBalanceFactor(root);
    if (Math.abs(balanceFactor) > 1) return false;

    return this.isBalanced(root.left) && this.isBalanced(root.right);
  }

  // Utility method to verify BST property
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

  // Get all keys in sorted order
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

  // Check if tree is empty
  isEmpty(): boolean {
    return this.root === null;
  }

  // Get the number of nodes in the tree
  size(): number {
    const countNodes = (node: BSTNode<T> | null): number => {
      if (!node) return 0;
      return 1 + countNodes(node.left) + countNodes(node.right);
    };

    return countNodes(this.root);
  }

  // Find minimum key
  findMin(): number | null {
    const minNode = this.findMinNode(this.root);
    return minNode ? minNode.key : null;
  }

  // Find maximum key
  findMax(): number | null {
    let current = this.root;
    while (current && current.right) {
      current = current.right;
    }
    return current ? current.key : null;
  }

  // Clear the tree
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
