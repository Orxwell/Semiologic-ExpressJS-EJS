// API connected with the client
import { connectDB } from '../importers/db.conn.mjs';


function typeVerifier ({ toEval, type }={}) {
  switch (type) {
    case 'array':
      return Array.isArray(toEval);
    case 'object':
      return typeof toEval === 'object' && toEval !== null;
    default:
      return typeof toEval === type;
  }
}


class CRUDController {
  constructor () { this.init(); }

  async init () {
    this.db = this.connectDB();
  }

  async connectDB () {
    try           { return await connectDB(); }
    catch (error) { console.error(error)    ; }
  }

  async createDocument ({ collection, document={} }={}) {
    try {
      if (!typeVerifier({ toEval: collection, type: 'string' })) {
        throw new Error("  ~Internal Server Error: 'collection' must be a string.~");
      }
      if (!typeVerifier({ toEval: document, type: 'object' })) {
        throw new Error("  ~Internal Server Error: 'document' must be an object.~");
      }

      return await this.db
        .collection(collection)
        .insertOne(document);

    } catch (error) { throw error; }
  }

  async createDocuments ({ collection, documents=[] }={}) {
    try {
      if (!typeVerifier({ toEval: collection, type: 'string' })) {
        throw new Error("  ~Internal Server Error: 'collection' must be a string.~");
      }
      if (!typeVerifier({ toEval: documents, type: 'array' })) {
        throw new Error("  ~Internal Server Error: 'documents' must be an array.~");
      }
      if (!documents.every(doc => typeVerifier({ toEval: doc, type: 'object' }))) {
        throw new Error("  ~Internal Server Error: 'documents' must contain only objects.~");
      }

      return await this.db
        .collection(collection)
        .insertMany(documents);

    } catch (error) { throw error; }
  }

  async findDocuments({ collection, toFind={}, projection={} }={}) {
    try {
      if (!typeVerifier({ toEval: collection, type: 'string' })) {
        throw new Error("  ~Internal Server Error: 'collection' must be a string.~");
      }
      if (!typeVerifier({ toEval: toFind, type: 'object' })) {
        throw new Error("  ~Internal Server Error: 'toFind' must be an object.~");
      }
      if (!typeVerifier({ toEval: projection, type: 'object' })) {
        throw new Error("  ~Internal Server Error: 'projection' must be an object.~");
      }

      return await this.db
        .collection(collection)
        .find(toFind, { projection: projection })
        .toArray();

    } catch (error) { throw error; }
  }

  async deleteDocument ({ collection, document={} }={}) {
    try {
      if (!typeVerifier({ toEval: collection, type: 'string' })) {
        throw new Error("  ~Internal Server Error: 'collection' must be a string.~");
      }
      if (!typeVerifier({ toEval: document, type: 'object' })) {
        throw new Error("  ~Internal Server Error: 'document' must be an object.~");
      }

      return await this.db
        .collection(collection)
        .deleteOne(document);

    } catch (error) { throw error; }
  }

  async deleteDocuments ({ collection, documents=[] }={}) {
    try {
      if (!typeVerifier({ toEval: collection, type: 'string' })) {
        throw new Error("  ~Internal Server Error: 'collection' must be a string.~");
      }
      if (!typeVerifier({ toEval: documents, type: 'array' })) {
        throw new Error("  ~Internal Server Error: 'documents' must be an array.~");
      }
      if (!documents.every(doc => typeVerifier({ toEval: doc, type: 'object' }))) {
        throw new Error("  ~Internal Server Error: 'documents' must contain only objects.~");
      }

      return await this.db
        .collection(collection)
        .deleteMany(documents);

    } catch (error) { throw error; }
  }

  async clearCollection ({ collection }={}) {
    try {
      if (!typeVerifier({ toEval: collection, type: 'string' })) {
        throw new Error("  ~Internal Server Error: 'collection' must be a string.~");
      }

      return await this.db
        .collection(collection)
        .deleteMany({});

    } catch (error) { throw error; }
  }
};


export default CRUDController;
