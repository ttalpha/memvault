import express from "express";
import chalk from "chalk";
import { CacheClient } from "memvault";
import { createUser, deleteUser, fetchUserFromDB, updateUser } from "./users";
import { User } from "./types";

const app = express();
const cacheClient = new CacheClient();

const PORT = 3000;
const HOST = "127.0.0.1";

for (let port = 6379; port <= 6388; port++) {
  cacheClient.connect(HOST, port);
}
app.use(express.json());

app.get("/user/:id", async (req, res) => {
  const userId = req.params.id;
  const cacheKey = `user:${userId}`;

  try {
    // 1. Try to get from MemVault
    const cachedUser = await cacheClient.get<User>(cacheKey);
    if (cachedUser) {
      console.log(
        chalk.greenBright(
          `[${new Date().toISOString()}] [INFO] Cache HIT for key: ${cacheKey}`
        )
      );

      return res.json({ source: "cache", data: cachedUser });
    }

    console.log(
      chalk.greenBright(
        `[${new Date().toISOString()}] [INFO] Cache MISS for key: ${cacheKey}`
      )
    );

    const userFromDB = await fetchUserFromDB(userId);

    if (userFromDB) {
      cacheClient.set(cacheKey, JSON.stringify(userFromDB), 120); // Cache for 120 seconds
      return res.json({ source: "database", data: userFromDB });
    }

    res.status(404).json({ message: "User not found" });
  } catch (error) {
    console.log(error);

    console.error(
      chalk.redBright(
        `[${new Date().toISOString()}] [ERROR] Error fetching user: ${error}`
      )
    );
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/user", async (req, res) => {
  try {
    const newUser = await createUser();
    const cacheKey = `user:${newUser.id}`;

    cacheClient.set(cacheKey, JSON.stringify(newUser));
    console.log(
      chalk.greenBright(
        `[${new Date().toISOString()}] [INFO] Create user successfully. Cache key: ${cacheKey}`
      )
    );
    return res.status(200).json({ message: "Create user successfully" });
  } catch (error) {
    console.error(
      chalk.redBright(
        `[${new Date().toISOString()}] [ERROR] Error creating a new user: ${error}`
      )
    );
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/user/:id", async (req, res) => {
  const userId = req.params.id;
  const { name, email } = req.body;

  const cacheKey = `user:${userId}`;
  try {
    const updatedUser = await updateUser(userId, { name, email });
    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    cacheClient.set(cacheKey, JSON.stringify(updatedUser));
    console.log(
      chalk.greenBright(
        `[${new Date().toISOString()}] [INFO] Update successfully key: ${cacheKey}`
      )
    );
    return res.status(200).json({ message: "Update successfully" });
  } catch (error) {
    console.error(
      chalk.redBright(
        `[${new Date().toISOString()}] [ERROR] Error updating user: ${error}`
      )
    );
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/user/:id", async (req, res) => {
  const userId = req.params.id;

  const cacheKey = `user:${userId}`;
  try {
    const deleted = await deleteUser(userId);
    if (!deleted) return res.status(404).json({ message: "User not found" });

    console.log(
      chalk.greenBright(
        `[${new Date().toISOString()}] [INFO] Delete successfully key "${cacheKey}"`
      )
    );
    cacheClient.delete(cacheKey);
    return res.status(200).json({ message: "Delete successfully" });
  } catch (error) {
    console.error(
      chalk.redBright(
        `[${new Date().toISOString()}] [ERROR] Error deleting user: ${error}`
      )
    );
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(
    chalk.blueBright(
      `[${new Date().toISOString()}] [INFO] Express API listening on port ${PORT}`
    )
  );
});
