import { GraphQLModule } from '@graphql-modules/core';

import resolvers from './resolvers';
import * as typeDefs from './schema.graphql';

const Hello = new GraphQLModule({ resolvers, typeDefs });

export default Hello;
