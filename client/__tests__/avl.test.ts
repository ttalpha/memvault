import { AVLTree, BSTNode } from "../src/avl";

describe("AVLTree", () => {
  let tree: AVLTree<string>;

  beforeEach(() => {
    tree = new AVLTree<string>();
  });

  describe("Basic Operations", () => {
    test("should create empty tree", () => {
      expect(tree.root).toBeNull();
      expect(tree.isEmpty()).toBe(true);
      expect(tree.size()).toBe(0);
      expect(tree.getHeight()).toBe(0);
      expect(tree.getBalanceFactor()).toBe(0);
    });

    test("should insert single node", () => {
      tree.set(10, "ten");
      expect(tree.root?.key).toBe(10);
      expect(tree.root?.value).toBe("ten");
      expect(tree.getHeight()).toBe(1);
      expect(tree.size()).toBe(1);
      expect(tree.isEmpty()).toBe(false);
    });

    test("should get existing node", () => {
      tree.set(10, "ten");
      const node = tree.get(10);
      expect(node?.key).toBe(10);
      expect(node?.value).toBe("ten");
    });

    test("should return null for non-existing node", () => {
      tree.set(10, "ten");
      const node = tree.get(5);
      expect(node).toBeNull();
    });

    test("should update existing node value", () => {
      tree.set(10, "ten");
      tree.set(10, "updated");
      const node = tree.get(10);
      expect(node?.value).toBe("updated");
      expect(tree.size()).toBe(1); // Size should remain the same
    });

    test("should find min and max values", () => {
      tree.set(10, "ten");
      tree.set(5, "five");
      tree.set(15, "fifteen");
      tree.set(3, "three");
      tree.set(20, "twenty");

      expect(tree.findMin()).toBe(3);
      expect(tree.findMax()).toBe(20);
    });

    test("should handle min/max on empty tree", () => {
      expect(tree.findMin()).toBeNull();
      expect(tree.findMax()).toBeNull();
    });

    test("should clear tree", () => {
      tree.set(10, "ten");
      tree.set(5, "five");
      tree.clear();
      expect(tree.isEmpty()).toBe(true);
      expect(tree.size()).toBe(0);
    });
  });

  describe("Height and Balance Factor", () => {
    test("should calculate height correctly for balanced tree", () => {
      tree.set(10, "ten");
      tree.set(5, "five");
      tree.set(15, "fifteen");

      expect(tree.getHeight()).toBe(2);
      expect(tree.getBalanceFactor()).toBe(0);
      expect(tree.isBalanced()).toBe(true);
    });

    test("should maintain balance after insertions", () => {
      const keys = [10, 5, 15, 3, 7, 12, 18];
      for (const key of keys) {
        tree.set(key, `value-${key}`);
        expect(tree.isBalanced()).toBe(true);
        expect(Math.abs(tree.getBalanceFactor())).toBeLessThanOrEqual(1);
      }
    });
  });

  describe("getNearestLargerNode", () => {
    let tree: AVLTree<string>;

    beforeEach(() => {
      tree = new AVLTree<string>();
    });

    test("returns null on empty tree", () => {
      expect(tree.getNearestLargerNode(10)).toBeNull();
    });

    test("returns null if only one node and key matches", () => {
      tree.set(10, "ten");
      const node = tree.getNearestLargerNode(10);
      expect(node).toBeNull();
    });

    test("returns root if only one node and key is less", () => {
      tree.set(10, "ten");
      const node = tree.getNearestLargerNode(5);
      expect(node?.key).toBe(10);
    });

    test("returns null if only one node and key is greater", () => {
      tree.set(10, "ten");
      const node = tree.getNearestLargerNode(15);
      expect(node).toBeNull();
    });

    test("returns nearest larger node for key not present", () => {
      tree.set(10, "ten");
      tree.set(20, "twenty");
      tree.set(5, "five");
      tree.set(15, "fifteen");
      // key = 12, nearest larger is 15
      const node = tree.getNearestLargerNode(12);
      expect(node?.key).toBe(15);
      expect(node?.value).toBe("fifteen");
    });

    test("returns nearest larger node for key less than all", () => {
      tree.set(10, "ten");
      tree.set(20, "twenty");
      tree.set(5, "five");
      const node = tree.getNearestLargerNode(1);
      expect(node?.key).toBe(5);
    });

    test("returns null for key greater than all", () => {
      tree.set(10, "ten");
      tree.set(20, "twenty");
      tree.set(5, "five");
      const node = tree.getNearestLargerNode(25);
      expect(node).toBeNull();
    });

    test("returns correct node in complex tree", () => {
      const keys = [50, 25, 75, 10, 30, 60, 80, 5, 15, 27, 35];
      for (const key of keys) {
        tree.set(key, `value-${key}`);
      }
      // key = 28, nearest larger is 30
      let node = tree.getNearestLargerNode(28);
      expect(node?.key).toBe(30);

      // key = 35, nearest larger is 50
      node = tree.getNearestLargerNode(35);
      expect(node?.key).toBe(50);

      // key = 80, nearest larger is 80 (exact match)
      node = tree.getNearestLargerNode(80);
      expect(node).toBeNull();

      // key = 81, nearest larger is null
      node = tree.getNearestLargerNode(81);
      expect(node).toBeNull();
    });

    test("works with explicit root argument", () => {
      tree.set(10, "ten");
      tree.set(20, "twenty");
      tree.set(5, "five");
      const root = tree.root;
      expect(tree.getNearestLargerNode(12, root)?.key).toBe(20);
    });
  });

  describe("SET Method - Rotation Cases", () => {
    test("Left-Left rotation (LL)", () => {
      // Insert in descending order to trigger LL rotation
      tree.set(30, "thirty");
      tree.set(20, "twenty");
      tree.set(10, "ten"); // This should trigger LL rotation

      // After LL rotation, 20 should be root
      expect(tree.root?.key).toBe(20);
      expect(tree.root?.left?.key).toBe(10);
      expect(tree.root?.right?.key).toBe(30);

      // Tree should be balanced
      expect(tree.isBalanced()).toBe(true);
      expect(tree.isBST()).toBe(true);
    });

    test("Right-Right rotation (RR)", () => {
      // Insert in ascending order to trigger RR rotation
      tree.set(10, "ten");
      tree.set(20, "twenty");
      tree.set(30, "thirty"); // This should trigger RR rotation

      // After RR rotation, 20 should be root
      expect(tree.root?.key).toBe(20);
      expect(tree.root?.left?.key).toBe(10);
      expect(tree.root?.right?.key).toBe(30);

      // Tree should be balanced
      expect(tree.isBalanced()).toBe(true);
      expect(tree.isBST()).toBe(true);
    });

    test("Left-Right rotation (LR)", () => {
      // Create LR case: insert 30, 10, 20
      tree.set(30, "thirty");
      tree.set(10, "ten");
      tree.set(20, "twenty"); // This should trigger LR rotation

      // After LR rotation, 20 should be root
      expect(tree.root?.key).toBe(20);
      expect(tree.root?.left?.key).toBe(10);
      expect(tree.root?.right?.key).toBe(30);

      // Tree should be balanced
      expect(tree.isBalanced()).toBe(true);
      expect(tree.isBST()).toBe(true);
    });

    test("Right-Left rotation (RL)", () => {
      // Create RL case: insert 10, 30, 20
      tree.set(10, "ten");
      tree.set(30, "thirty");
      tree.set(20, "twenty"); // This should trigger RL rotation

      // After RL rotation, 20 should be root
      expect(tree.root?.key).toBe(20);
      expect(tree.root?.left?.key).toBe(10);
      expect(tree.root?.right?.key).toBe(30);

      // Tree should be balanced
      expect(tree.isBalanced()).toBe(true);
      expect(tree.isBST()).toBe(true);
    });

    test("Complex insertion sequence with multiple rotations", () => {
      const keys = [50, 25, 75, 10, 30, 60, 80, 5, 15, 27, 35];

      for (const key of keys) {
        tree.set(key, `value-${key}`);
        // After each insertion, tree should remain balanced
        expect(tree.isBalanced()).toBe(true);
        expect(tree.isBST()).toBe(true);
      }

      expect(tree.size()).toBe(keys.length);

      // Verify all nodes are present
      for (const key of keys) {
        expect(tree.get(key)).not.toBeNull();
      }
    });

    test("Ascending sequence insertion prevents skewing", () => {
      // This would create a completely skewed tree without balancing
      for (let i = 1; i <= 15; i++) {
        tree.set(i, `value-${i}`);
        expect(tree.isBalanced()).toBe(true);
        expect(tree.isBST()).toBe(true);
      }

      // Height should be logarithmic, not linear
      const height = tree.getHeight();
      expect(height).toBeLessThan(15); // Should be around 4-5 for balanced tree
      expect(height).toBeLessThanOrEqual(Math.ceil(Math.log2(15 + 1)));

      // Verify inorder traversal gives sorted sequence
      expect(tree.inorderTraversal()).toEqual([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
      ]);
    });

    test("Descending sequence insertion prevents skewing", () => {
      // This would create a completely skewed tree without balancing
      for (let i = 15; i >= 1; i--) {
        tree.set(i, `value-${i}`);
        expect(tree.isBalanced()).toBe(true);
        expect(tree.isBST()).toBe(true);
      }

      // Height should be logarithmic, not linear
      const height = tree.getHeight();
      expect(height).toBeLessThan(15); // Should be around 4-5 for balanced tree

      // Verify inorder traversal gives sorted sequence
      expect(tree.inorderTraversal()).toEqual([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
      ]);
    });
  });

  describe("DELETE Method - Rotation Cases", () => {
    beforeEach(() => {
      // Create a larger balanced tree for deletion tests
      const keys = [50, 25, 75, 10, 30, 60, 80, 5, 15, 27, 35, 55, 65, 77, 85];
      for (const key of keys) {
        tree.set(key, `value-${key}`);
      }
    });

    test("Delete leaf node without rebalancing", () => {
      const initialSize = tree.size();
      tree.delete(5);

      expect(tree.get(5)).toBeNull();
      expect(tree.size()).toBe(initialSize - 1);
      expect(tree.isBalanced()).toBe(true);
      expect(tree.isBST()).toBe(true);
    });

    test("Delete node with one child", () => {
      // First create a structure where a node has only one child
      tree.clear();
      tree.set(10, "ten");
      tree.set(5, "five");
      tree.set(3, "three");

      tree.delete(5); // Has only left child
      expect(tree.get(5)).toBeNull();
      expect(tree.get(3)).not.toBeNull();
      expect(tree.get(10)).not.toBeNull();
      expect(tree.isBalanced()).toBe(true);
      expect(tree.isBST()).toBe(true);
    });

    test("Delete node with two children", () => {
      const initialSize = tree.size();
      tree.delete(25); // 25 has two children

      expect(tree.get(25)).toBeNull();
      expect(tree.size()).toBe(initialSize - 1);
      expect(tree.isBalanced()).toBe(true);
      expect(tree.isBST()).toBe(true);

      // Verify tree structure is still valid
      expect(tree.get(10)).not.toBeNull();
      expect(tree.get(30)).not.toBeNull();
    });

    test("Delete root node", () => {
      const rootKey = tree.root!.key;
      const initialSize = tree.size();

      tree.delete(rootKey);

      expect(tree.get(rootKey)).toBeNull();
      expect(tree.size()).toBe(initialSize - 1);
      expect(tree.isBalanced()).toBe(true);
      expect(tree.isBST()).toBe(true);
    });

    test("Delete triggering Left-Left rotation", () => {
      // Create specific structure that will trigger LL rotation after deletion
      tree.clear();
      tree.set(20, "twenty");
      tree.set(10, "ten");
      tree.set(30, "thirty");
      tree.set(5, "five");
      tree.set(15, "fifteen");
      tree.set(3, "three");

      // Delete from right side to make left side heavy
      tree.delete(30);

      expect(tree.isBalanced()).toBe(true);
      expect(tree.isBST()).toBe(true);
      expect(tree.get(30)).toBeNull();
    });

    test("Delete triggering Right-Right rotation", () => {
      // Create specific structure that will trigger RR rotation after deletion
      tree.clear();
      tree.set(20, "twenty");
      tree.set(10, "ten");
      tree.set(30, "thirty");
      tree.set(25, "twentyfive");
      tree.set(35, "thirtyfive");
      tree.set(40, "forty");

      // Delete from left side to make right side heavy
      tree.delete(10);

      expect(tree.isBalanced()).toBe(true);
      expect(tree.isBST()).toBe(true);
      expect(tree.get(10)).toBeNull();
    });

    test("Delete triggering Left-Right rotation", () => {
      // Create specific structure for LR rotation
      tree.clear();
      tree.set(30, "thirty");
      tree.set(10, "ten");
      tree.set(40, "forty");
      tree.set(5, "five");
      tree.set(20, "twenty");
      tree.set(15, "fifteen");

      // Delete to trigger imbalance
      tree.delete(40);

      expect(tree.isBalanced()).toBe(true);
      expect(tree.isBST()).toBe(true);
      expect(tree.get(40)).toBeNull();
    });

    test("Delete triggering Right-Left rotation", () => {
      // Create specific structure for RL rotation
      tree.clear();
      tree.set(10, "ten");
      tree.set(5, "five");
      tree.set(30, "thirty");
      tree.set(20, "twenty");
      tree.set(40, "forty");
      tree.set(25, "twentyfive");

      // Delete to trigger imbalance
      tree.delete(5);

      expect(tree.isBalanced()).toBe(true);
      expect(tree.isBST()).toBe(true);
      expect(tree.get(5)).toBeNull();
    });

    test("Sequential deletion maintaining balance", () => {
      const keysToDelete = [77, 85, 65, 55, 35, 27, 15, 5];
      let expectedSize = tree.size();

      for (const key of keysToDelete) {
        tree.delete(key);
        expectedSize--;

        expect(tree.get(key)).toBeNull();
        expect(tree.size()).toBe(expectedSize);
        expect(tree.isBalanced()).toBe(true);
        expect(tree.isBST()).toBe(true);
      }
    });

    test("Delete all nodes maintains balance", () => {
      const allKeys = tree.inorderTraversal();
      const shuffledKeys = [...allKeys].sort(() => Math.random() - 0.5);

      for (const key of shuffledKeys) {
        tree.delete(key);
        expect(tree.get(key)).toBeNull();

        if (!tree.isEmpty()) {
          expect(tree.isBalanced()).toBe(true);
          expect(tree.isBST()).toBe(true);
        }
      }

      expect(tree.isEmpty()).toBe(true);
      expect(tree.size()).toBe(0);
    });
  });

  describe("Complex Scenarios", () => {
    test("Alternating insert and delete operations", () => {
      const operations = [
        { op: "insert", key: 50, value: "fifty" },
        { op: "insert", key: 25, value: "twentyfive" },
        { op: "insert", key: 75, value: "seventyfive" },
        { op: "delete", key: 25 },
        { op: "insert", key: 30, value: "thirty" },
        { op: "insert", key: 20, value: "twenty" },
        { op: "delete", key: 75 },
        { op: "insert", key: 80, value: "eighty" },
        { op: "insert", key: 10, value: "ten" },
        { op: "delete", key: 50 },
      ];

      const expectedKeys = new Set<number>();

      for (const operation of operations) {
        if (operation.op === "insert") {
          tree.set(operation.key, operation.value!);
          expectedKeys.add(operation.key);
        } else {
          tree.delete(operation.key);
          expectedKeys.delete(operation.key);
        }

        expect(tree.isBalanced()).toBe(true);
        expect(tree.isBST()).toBe(true);
        expect(tree.size()).toBe(expectedKeys.size);
      }

      // Verify final state
      for (const key of expectedKeys) {
        expect(tree.get(key)).not.toBeNull();
      }
    });

    test("Stress test with random operations", () => {
      const keys = new Set<number>();
      const operations = 100;

      for (let i = 0; i < operations; i++) {
        const key = Math.floor(Math.random() * 1000);
        const shouldDelete = Math.random() > 0.7 && keys.size > 0;

        if (shouldDelete) {
          const keysArray = Array.from(keys);
          const keyToDelete =
            keysArray[Math.floor(Math.random() * keysArray.length)];
          tree.delete(keyToDelete);
          keys.delete(keyToDelete);
        } else {
          tree.set(key, `value-${key}`);
          keys.add(key);
        }

        expect(tree.isBalanced()).toBe(true);
        expect(tree.isBST()).toBe(true);
        expect(tree.size()).toBe(keys.size);
      }

      // Verify all remaining keys are still in the tree
      for (const key of keys) {
        expect(tree.get(key)).not.toBeNull();
      }
    });

    test("Large sequential operations", () => {
      // Insert 1000 sequential numbers
      for (let i = 1; i <= 1000; i++) {
        tree.set(i, `value-${i}`);

        // Check balance every 100 insertions
        if (i % 100 === 0) {
          expect(tree.isBalanced()).toBe(true);
          expect(tree.isBST()).toBe(true);
        }
      }

      expect(tree.size()).toBe(1000);

      // Height should be logarithmic
      const height = tree.getHeight();
      expect(height).toBeLessThanOrEqual(Math.ceil(Math.log2(1000 + 1)) + 2); // +2 for AVL tolerance

      // Delete every other number
      for (let i = 2; i <= 1000; i += 2) {
        tree.delete(i);

        if (i % 200 === 0) {
          expect(tree.isBalanced()).toBe(true);
          expect(tree.isBST()).toBe(true);
        }
      }

      expect(tree.size()).toBe(500);
    });
  });

  describe("Edge Cases", () => {
    test("Delete from empty tree", () => {
      tree.delete(10);
      expect(tree.isEmpty()).toBe(true);
      expect(tree.size()).toBe(0);
    });

    test("Delete non-existent key", () => {
      tree.set(10, "ten");
      const initialSize = tree.size();

      tree.delete(20);

      expect(tree.size()).toBe(initialSize);
      expect(tree.get(10)).not.toBeNull();
    });

    test("Single node operations", () => {
      tree.set(10, "ten");
      expect(tree.getHeight()).toBe(1);
      expect(tree.getBalanceFactor()).toBe(0);
      expect(tree.isBalanced()).toBe(true);
      expect(tree.size()).toBe(1);

      tree.delete(10);
      expect(tree.isEmpty()).toBe(true);
      expect(tree.size()).toBe(0);
    });

    test("Duplicate key handling", () => {
      tree.set(10, "original");
      tree.set(10, "updated");
      tree.set(10, "final");

      expect(tree.size()).toBe(1);
      expect(tree.get(10)?.value).toBe("final");
    });
  });

  describe("Tree Structure Validation", () => {
    test("toString method produces output", () => {
      expect(tree.toString()).toBe("Empty tree");

      tree.set(10, "ten");
      tree.set(5, "five");
      tree.set(15, "fifteen");

      const treeString = tree.toString();
      expect(treeString).toContain("10");
      expect(treeString).toContain("5");
      expect(treeString).toContain("15");
      expect(treeString).not.toBe("Empty tree");
    });

    test("Inorder traversal returns sorted keys", () => {
      const keys = [50, 25, 75, 10, 30, 60, 80, 5, 15, 27, 35];

      for (const key of keys) {
        tree.set(key, `value-${key}`);
      }

      const inorder = tree.inorderTraversal();
      const sorted = [...keys].sort((a, b) => a - b);

      expect(inorder).toEqual(sorted);
    });

    test("BST property maintained after all operations", () => {
      // Complex sequence of operations
      const operations = [
        () => tree.set(50, "fifty"),
        () => tree.set(30, "thirty"),
        () => tree.set(70, "seventy"),
        () => tree.set(20, "twenty"),
        () => tree.set(40, "forty"),
        () => tree.set(60, "sixty"),
        () => tree.set(80, "eighty"),
        () => tree.delete(30),
        () => tree.set(35, "thirtyfive"),
        () => tree.delete(70),
        () => tree.set(25, "twentyfive"),
        () => tree.delete(50),
      ];

      for (const operation of operations) {
        operation();
        expect(tree.isBST()).toBe(true);
        expect(tree.isBalanced()).toBe(true);
      }
    });

    test("Tree maintains properties after multiple clears and rebuilds", () => {
      for (let round = 0; round < 5; round++) {
        // Build tree
        for (let i = 1; i <= 20; i++) {
          tree.set(i * (round + 1), `value-${i * (round + 1)}`);
        }

        expect(tree.isBalanced()).toBe(true);
        expect(tree.isBST()).toBe(true);
        expect(tree.size()).toBe(20);

        // Clear tree
        tree.clear();
        expect(tree.isEmpty()).toBe(true);
        expect(tree.size()).toBe(0);
      }
    });
  });

  describe("Utility Methods", () => {
    test("isEmpty works correctly", () => {
      expect(tree.isEmpty()).toBe(true);

      tree.set(1, "one");
      expect(tree.isEmpty()).toBe(false);

      tree.delete(1);
      expect(tree.isEmpty()).toBe(true);
    });

    test("size tracks correctly", () => {
      expect(tree.size()).toBe(0);

      tree.set(1, "one");
      tree.set(2, "two");
      tree.set(3, "three");
      expect(tree.size()).toBe(3);

      tree.set(2, "updated two"); // Update, not insert
      expect(tree.size()).toBe(3);

      tree.delete(1);
      expect(tree.size()).toBe(2);

      tree.clear();
      expect(tree.size()).toBe(0);
    });

    test("findMin and findMax work correctly", () => {
      expect(tree.findMin()).toBeNull();
      expect(tree.findMax()).toBeNull();

      const keys = [50, 30, 70, 20, 40, 60, 80];
      for (const key of keys) {
        tree.set(key, `value-${key}`);
      }

      expect(tree.findMin()).toBe(20);
      expect(tree.findMax()).toBe(80);

      tree.delete(20);
      expect(tree.findMin()).toBe(30);

      tree.delete(80);
      expect(tree.findMax()).toBe(70);
    });
  });

  describe("getMinNode", () => {
    let tree: AVLTree<string>;

    beforeEach(() => {
      tree = new AVLTree<string>();
    });

    test("returns null for empty tree", () => {
      expect(tree.getMinNode()).toBeNull();
    });

    test("returns root for single node tree", () => {
      tree.set(10, "ten");
      const minNode = tree.getMinNode();
      expect(minNode?.key).toBe(10);
      expect(minNode?.value).toBe("ten");
    });

    test("returns leftmost node for multi-node tree", () => {
      tree.set(20, "twenty");
      tree.set(10, "ten");
      tree.set(5, "five");
      tree.set(15, "fifteen");
      tree.set(25, "twentyfive");
      const minNode = tree.getMinNode();
      expect(minNode?.key).toBe(5);
      expect(minNode?.value).toBe("five");
    });

    test("works with explicit root argument (subtree)", () => {
      tree.set(20, "twenty");
      tree.set(10, "ten");
      tree.set(5, "five");
      tree.set(15, "fifteen");
      tree.set(25, "twentyfive");
      const leftSubtree = tree.root?.left;
      const minNode = tree.getMinNode(leftSubtree);
      expect(minNode?.key).toBe(5);
      expect(minNode?.value).toBe("five");
    });
  });

  describe("getSuccessor", () => {
    let tree: AVLTree<string>;

    beforeEach(() => {
      tree = new AVLTree<string>();
    });

    test("returns null for empty tree", () => {
      expect(tree.getSuccessor(null)).toBeNull();
    });

    test("returns null for single node tree", () => {
      tree.set(10, "ten");
      const node = tree.get(10)!;
      expect(tree.getSuccessor(node)).toBeNull();
    });

    test("returns min of right subtree if node has right child", () => {
      tree.set(20, "twenty");
      tree.set(10, "ten");
      tree.set(30, "thirty");
      tree.set(25, "twentyfive");
      tree.set(35, "thirtyfive");
      const node = tree.get(30)!;
      const successor = tree.getSuccessor(node);
      expect(successor?.key).toBe(35);
      expect(successor?.value).toBe("thirtyfive");
    });

    test("returns nearest ancestor for which node is in left subtree", () => {
      tree.set(20, "twenty");
      tree.set(10, "ten");
      tree.set(30, "thirty");
      tree.set(25, "twentyfive");
      tree.set(35, "thirtyfive");
      const node = tree.get(25)!;
      const successor = tree.getSuccessor(node);
      expect(successor?.key).toBe(30);
      expect(successor?.value).toBe("thirty");
    });

    test("returns null for max node", () => {
      tree.set(20, "twenty");
      tree.set(10, "ten");
      tree.set(30, "thirty");
      tree.set(25, "twentyfive");
      tree.set(35, "thirtyfive");
      const node = tree.get(35)!;
      expect(tree.getSuccessor(node)).toBeNull();
    });

    test("returns next larger node for min node", () => {
      tree.set(20, "twenty");
      tree.set(10, "ten");
      tree.set(30, "thirty");
      tree.set(5, "five");
      tree.set(15, "fifteen");
      const node = tree.get(5)!;
      const successor = tree.getSuccessor(node);
      expect(successor?.key).toBe(10);
      expect(successor?.value).toBe("ten");
    });

    test("returns correct successor for middle node", () => {
      tree.set(20, "twenty");
      tree.set(10, "ten");
      tree.set(30, "thirty");
      tree.set(25, "twentyfive");
      tree.set(35, "thirtyfive");
      const node = tree.get(20)!;
      const successor = tree.getSuccessor(node);
      expect(successor?.key).toBe(25);
      expect(successor?.value).toBe("twentyfive");
    });

    test("returns correct successor for root node", () => {
      tree.set(20, "twenty");
      tree.set(10, "ten");
      tree.set(30, "thirty");
      tree.set(25, "twentyfive");
      tree.set(35, "thirtyfive");
      const node = tree.root!;
      const successor = tree.getSuccessor(node);
      expect(successor?.key).toBe(25);
      expect(successor?.value).toBe("twentyfive");
    });

    test("returns correct successor for leaf node", () => {
      tree.set(20, "twenty");
      tree.set(10, "ten");
      tree.set(30, "thirty");
      tree.set(25, "twentyfive");
      tree.set(35, "thirtyfive");
      const node = tree.get(25)!;
      const successor = tree.getSuccessor(node);
      expect(successor?.key).toBe(30);
      expect(successor?.value).toBe("thirty");
    });
  });
});
