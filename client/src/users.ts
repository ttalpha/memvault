const mockUsers = Array.from({ length: 1_000_000 }, (_, i) => ({
  id: (i + 1).toString(),
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
}));

export async function fetchUserFromDB(userId: string) {
  console.log(
    `[${new Date().toISOString()}] [APP] Simulating DB fetch for user ${userId}...`
  );
  return new Promise((resolve) =>
    setTimeout(() => {
      const userData = mockUsers.find((user) => user.id === userId);
      console.log(
        `[${new Date().toISOString()}] [APP] Fetched user ${userId} from DB.`
      );
      resolve(userData);
    }, 1000)
  );
}

export async function updateUser(
  userId: string,
  body: Omit<(typeof mockUsers)[0], "id">
): Promise<(typeof mockUsers)[0] | null> {
  console.log(
    `[${new Date().toISOString()}] [APP] Simulating DB update for user ${userId}...`
  );
  return new Promise((resolve, reject) =>
    setTimeout(() => {
      const index = mockUsers.findIndex((user) => user.id === userId);

      console.log(
        `[${new Date().toISOString()}] [APP] Fetched user ${userId} from DB.`
      );
      if (index === -1) reject(new Error("User does not exist"));
      else {
        mockUsers[index] = { id: userId, ...body };
        resolve(mockUsers[index]);
      }
    }, 1000)
  );
}

export async function deleteUser(
  userId: string
): Promise<(typeof mockUsers)[0] | null> {
  console.log(
    `[${new Date().toISOString()}] [APP] Simulating DB delete for user ${userId}...`
  );
  return new Promise((resolve) =>
    setTimeout(() => {
      const index = mockUsers.findIndex((user) => user.id === userId);

      console.log(
        `[${new Date().toISOString()}] [APP] Fetched user ${userId} from DB.`
      );
      if (index === -1) resolve(null);
      else {
        const user = mockUsers[index];
        mockUsers.splice(index, 1);
        resolve(user);
      }
    }, 1000)
  );
}
