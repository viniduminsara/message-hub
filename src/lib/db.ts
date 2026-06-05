import { MongoClient, Db, Collection } from "mongodb"

declare global {
  var _mongoClient: MongoClient | undefined
}

const uri = process.env.DATABASE_URL!

let client: MongoClient
let db: Db

async function connect() {
  if (global._mongoClient) {
    client = global._mongoClient
  } else {
    client = new MongoClient(uri)
    global._mongoClient = client
    await client.connect()
  }
  db = client.db()
  return { client, db }
}

export async function getDb(): Promise<Db> {
  if (!db) {
    const c = await connect()
    db = c.db
  }
  return db
}

export async function getCollection<T extends Document = Document>(
  name: string
): Promise<Collection<T>> {
  const database = await getDb()
  return database.collection<T>(name)
}

export async function closeConnection() {
  if (client) {
    await client.close()
    global._mongoClient = undefined
  }
}

export { MongoClient }

export type Doc = Record<string, unknown>
