import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { makeExecutableSchema } from '@graphql-tools/schema';

import { authDirectiveTypeDefs , authDirectiveTransformer } from "./directives/auth.js"
import typeDefs from "./graphql/typeDefs/index.js"
import resolvers from './graphql/resolvers/index.js';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient()

let schema = makeExecutableSchema({
  typeDefs: [ authDirectiveTypeDefs, ...typeDefs ],
  resolvers 
})
schema = authDirectiveTransformer(schema)

const server = new ApolloServer({ schema });

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async () => {

    const user = {
      id: 1,
      username: "ben",
      password: "test",
      role: "ADMIN",
    }
    
    return { user, prisma }
  }
})
console.log(`Start: ${url}`);