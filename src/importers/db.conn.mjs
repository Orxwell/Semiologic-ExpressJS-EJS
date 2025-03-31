import env from './env.load.mjs';

import { MongoClient, ServerApiVersion } from 'mongodb';

if (!env.URI_CLUSTER) {
  throw new Error("  ~ENV-Error: 'URI_CLUSTER' not found.~"); 
}
if (!env.USERNAME_CLUSTER) {
  throw new Error("  ~ENV-Error: 'USERNAME_CLUSTER' not found.~"); 
}
if (!env.PASSWORD_CLUSTER) {
  throw new Error("  ~ENV-Error: 'PASSWORD_CLUSTER' not found.~");
}
if (!env.DBNAME_CLUSTER) {
  throw new Error("  ~ENV-Error: 'DBNAME_CLUSTER' not found.~");
}

// -----------Configuring the MongoDB-client - BELOW-----------
const URI = env.URI_CLUSTER
  .replace('<username_cluster>', encodeURIComponent(env.USERNAME_CLUSTER))
  .replace('<password_cluster>', encodeURIComponent(env.PASSWORD_CLUSTER));

const client_config = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
 };

const client = new MongoClient(URI, client_config);
// -----------Configuring the MongoDB-client - ABOVE-----------

// -----------Connecting to the Cluster - BELOW-----------
/**
* @type {import('mongodb').Db}
*/
let db;

export async function connectDB() {
  if (db) return db;

  try {
    await client.connect();
    console.log('  ~Connected to MongoDB.~');

    db = client.db(env.DBNAME_CLUSTER);
    console.log(`  ~Using cluster: ${env.DBNAME_CLUSTER}~`);

    return db;
  } catch (error) {
    console.error(
      '\n  ~An error occurred while connecting to MongoDB.~' +
      `\n    -> ${error.message}`
    );
    throw error;
  }
}
// -----------Connecting to the Cluster - ABOVE-----------
