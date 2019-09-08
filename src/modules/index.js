import { GraphQLModule } from '@graphql-modules/core';

import Hello from './hello';

const AppModule = new GraphQLModule({
  imports: [
    Hello,
  ],
});

export default AppModule;
