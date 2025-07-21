# MemVault

## Overview
MemVault is a fault-tolerant, distributed in-memory key-value store (Redis clone).

## Features
### Basic Key-Value Operations

#### Get the corresponding value by the key
```
GET <key>
```

#### Set a key-value pair (create/update)
```
SET <key> <value> (EX <ttl>)
```
where `ttl` is the Time-To-Live of the pair i.e., the time (in seconds) the pair will be in the cache.

#### Delete a key-value pair
```
DEL <key>
```

## Technology
* [Node.js](https://nodejs.org)
* [Doubly Linked List](https://en.wikipedia.org/wiki/Doubly_linked_list)
* [LRU](https://en.wikipedia.org/wiki/Cache_replacement_policies#Least_Recently_Used_(LRU))
* [Binary Search Tree](https://en.wikipedia.org/wiki/Binary_search_tree)
* [AVL Tree](https://en.wikipedia.org/wiki/AVL_tree)

## Explanation
(more to be added. Read the code to understand how it works)

## Works Done
[x] Storing key-value pairs in the cache
[x] Implementing LRU policy, TTL with lazy expiration
[x] Sharding with consistent hashing (AVL Tree)

## Future Works
[ ] Synchronous Replication
[ ] Failure Detection
[ ] Leader Election
[ ] Re-balancing / Self-healing
[ ] Data persistence on disk