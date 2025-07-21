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
* [Typescript](https://typescriptlang.org)
* [Doubly Linked List](https://en.wikipedia.org/wiki/Doubly_linked_list)
* [LRU](https://en.wikipedia.org/wiki/Cache_replacement_policies#Least_Recently_Used_(LRU))
* [Binary Search Tree](https://en.wikipedia.org/wiki/Binary_search_tree)
* [AVL Tree](https://en.wikipedia.org/wiki/AVL_tree)

## Setup
### Prerequisites
* [Docker](https://www.docker.com/products/docker-desktop/)
* [Node.js 22.x and higher](https://nodejs.org)
* Yarn
```bash
npm i -g yarn@latest
```

### Installation

1. Clone the repository
```bash
git clone https://github.com/ttalpha/memvault.git
```

2. Build MemVault Cache image
```bash
cd cache/
sh build_docker.sh
```

3. Run MemVault Cache containers
```bash
docker compose up -d # run in the background
```

4. Install all the client dependencies
```bash
cd client/
yarn
```

5. Run the client
```bash
yarn build
yarn start
```

6. Use [Postman](https://www.postman.com/) or cURL to make API requests to these test endpoints on [http://localhost:3000](http://localhost:3000):
* `GET /user/:id`: return a user by their ID to see if their data is from a "slow source" or MemVault Cache
* `PUT /user/:id`: update a user by their ID to test if their data is correctly updated in the cache
* `DELETE /user/:id`: delete a user by their ID to test if their data is removed from the cache

7. Run tests (both in `cache/` and `client/`)

> To run tests in `cache/`, run `yarn` first to install all the dependencies.

To run automated tests, simply run:

```bash
yarn test
```


## Explanation
(More to be added soon. For the time being, please read the code to understand how it works)

## Works Done
- [x] Storing key-value pairs in the cache
- [x] Implementing LRU policy, TTL with lazy expiration
- [x] Sharding with consistent hashing (AVL Tree)

## Future Works
- [ ] Synchronous Replication
- [ ] Failure Detection
- [ ] Leader Election
- [ ] Re-balancing / Self-healing
- [ ] Data persistence on disk