import { getClientPromise } from "@/lib/mongodb";

export async function ensureIndexes() {
  const client = await getClientPromise();
  const db = client.db("wad-01");
  const userCollection = db.collection("user");

  // These MUST be inside the curly braces
  await userCollection.createIndex({ username: 1 }, { unique: true });
  await userCollection.createIndex({ email: 1 }, { unique: true });
  
  console.log("Indexes created successfully!"); 
}