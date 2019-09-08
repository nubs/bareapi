# bareapi
A barebones GraphQL API.

## Table of Contents
* [Development](#development)
  * [Install Prerequisites](#install-prerequisites)
  * [Starting the API](#starting-the-api)
  * [GraphQL Playground](#graphql-playground)
  * [pgAdmin](#pgadmin)
  * [Builds](#builds)
  * [Architecture](#architecture)
    * [Dataloaders](#dataloaders)
* [Configuration](#configuration)
  * [Environment Variables](#environment-variables)
* [API Endpoints](#api-endpoints)
* [Monitoring](#monitoring)
  * [Logging](#logging)
  * [Error Handling](#error-handling)
  * [Request Tracing](#request-tracing)

## Development
This is a standard [GraphQL][graphql] [Node.js][nodejs] API built on top of the
[Express][express] and [Apollo Server][apollo-server] frameworks and the
[PostgreSQL][postgres] database using the [Sequelize][sequelize] database
framework. Local development is meant to be done through [Docker][docker] and
[Docker Compose][docker-compose]. Using the following process will ensure that
your local development environment closely matches the development environment
of the rest of the team and mimics the production environment as closely as
possible.

### Install Prerequisites
The only prerequisites that you will absolutely need to install in order to
follow this process are [Docker][docker] and [Docker Compose][docker-compose].
You may also wish to install [Node.js][nodejs].

### Starting the API
The first step will be to [configure](#configuration) the API. To start the
API for development, use the `docker-compose` CLI to bring up the application.

```sh
# Execute in foreground
docker-compose up

# - OR -

# Execute in background
docker-compose up --detach
```

This will startup the API, database, and other necessary services and will
watch for changes made to your project and restart the application as
necessary. It is also possible to change the build target for the application
to build the `dist` image. This image will not watch for file changes and will
compile and build the project at build time rather than at run time.

### GraphQL Playground
Assuming that the playground is enabled in the
[configuration](#api_enable_playground), you should be able to access
the GraphQL playground on the `/graphql` path. Assuming the default port of
`4001`, that should be available at http://localhost:4001/graphql. The
playground allows you to browse the GraphQL schema and build/execute requests
in order to quickly develop against the new API. You can think of it as a
Postman specially tailored for GraphQL.

### pgAdmin
The Docker Compose service includes a [pgAdmin][pgadmin] service that will
provide an easy-to-use web interface for accessing the database through when
doing local development (of course any other database tool can be used as
well). To access it, assuming the default port is left alone, visit
http://localhost:5430.

### Builds
Builds for this project can either be executed through Docker Compose or
directly via NPM.

#### lint
The lint task performs static code analysis using [ESLint][eslint] to verify
that code has consistent styling and follows certain best practices. The
linting configuration is based off of
[eslint-config-airbnb-base][eslint-config-airbnb-base].

```sh
# Execute via docker-compose
docker-compose --file docker-compose.utilities.yml run lint

# Execute via npm
npm run lint
```

#### build:dist
The dist build transpiles the ES6 module based code into native JavaScript to
be executed without requiring `babel`. It is executed automatically when
building the `Dockerfile` for `dist`, but can also be executed manually.

```sh
# Execute via npm
npm run build:dist
```

### Architecture
This application follows a fairly simple layout underneath the [`src`](src)
directory with top-level application code at the root and the GraphQL modules
nested in the [`modules`](src/modules) subdirectory.  The business logic should
reside there.

#### Dataloaders
In order to simplify the common model querying patterns in an efficient way,
this application takes advantage of the [DataLoader][dataloader] library. The
standard setup re-initializes each of the dataloaders for each request so that
the caching behavior can be used, but does not bleed across requests. Several
custom dataloaders are provided in [the `dataloaders` folder](src/dataloaders)
and can be reused for different models.

##### Model by Field
The [`modelByField`
dataloader](src/dataloaders/modelByField.ts) is used to query for a single
model by a single field. This is generally used to lookup a model by a unique
key. The [`modelById` dataloader](#model-by-id) is recommended when wanting to
query based on the `id` field as a special case.

The dataloader takes the model and the field to query by at initialization, and
then for the `load` calls it just takes a single value to query for.
```js
// Initialize the dataloader
const productBySKU = modelByField(Product, 'sku');

// Fetch a single record
const myProduct = await productBySKU.load('KEY-SKU-1234');
```

##### Model by ID
The [`modelById` dataloader](src/dataloaders/modelById.ts) is used to query for
a single model by its id. It is a special case of the generic [`modelByField`
dataloader](#model-by-field) used to simplify this common use case.

The dataloader takes the model to query by at initialization, and then for the
`load` calls it just takes a single id to query for.
```js
// Initialize the dataloader
const productById = modelById(Product);

// Fetch a single record
const myProduct = await productById('1234');
```

## Configuration
The ultimate source of configuration for this application is environment
variables. They can be provided from a variety of sources.

For local development, it is recommended to copy over
[`docker-compose.override.yml.example`](docker-compose.override.yml.example)
to `docker-compose.override.yml` and edit it to set the appropriate
configuration.

### Environment Variables
This is a list of supported environment variables and a brief description of
what they do. Not all of these environment variables are required, but they
can be used to customize behavior of the application.

#### `API_CORS_ALLOWED_ORIGINS`
A comma-delimited list of allowed origins to access the API using
[CORS][cors]. If not specified, CORS will be disabled and API requests will be
denied to cross-origin browser requests.

#### `API_DB_URL`
The URL to the PostgreSQL database for the API. This URL will specify the full
configuration for connecting to the database.

#### `API_ENABLE_INTROSPECTION`
Set to the string `true` in order to enable GraphQL schema introspection. This
should be enabled for development as it enables the schema exploration in the
GraphQL Playground. This should be disabled in production.

#### `API_ENABLE_PLAYGROUND`
Set to the string `true` in order to enable the interactive GraphQL
playground. This should be enabled for development as it is helpful to use
when trying out API requests. This should be disabled in production.

#### `API_ENABLE_TRACING`
Set to the string `true` in order to enable tracing data to be returned in the
GraphQL responses. This should be disabled in production.

#### `API_PORT`
The port the application will listen on. This defaults to `4001` but can be
overwritten to customize the behavior. This can be desirable if an existing
service is already listening on the assigned port.

#### `LOG_COLORS`
Set to the string `true` in order to enable colorful logs. This is nice for
local development where the logs are printed to a console and the colors can
help draw attention where it is needed. In production, this should be left
disabled for better logging to cloud services like AWS CloudWatch.

#### `LOG_LEVEL`
This controls the amount of data that is logged. The available levels for
logging are [described below](#logging) and the default level if none is set
is `info`. For local development, it may be desirable to increase the amount
of logging in order to easily debug issues.

## API Endpoints
GraphQL does a good job of describing the API. Take a look at the schema in the
playground to see more.

## Monitoring
This API facilitates monitoring via logging and request tracing.

### Logging
This API uses [winston][winston] for logging. This enables the application to
log at custom error levels and include objects in the log for more
information.

### Error Handling
Apollo Server provides automatic error handling with hooks that this
application uses to prevent leaking details. For any unexpected errors, the
beset course of action is to let the error bubble up to the global handler
which will log the error but only report an unknown error to the user.

### Request Tracing
All logs for API requests will include several request ids in order to
facilitate tracing log messages across each individual API request and
matching those requests to requests made to other systems as well. Every
single request will be assigned a randomly-generated `requestId`.

If an API request includes an `X-Parent-Request-Id` header, it will be logged
as the `parentRequestId`. That header is expected to be set by the parent
application to its own internal `requestId` that signifies a single request, if
there is one. By being able to trace back through logs and other auditing
systems it should be possible to better diagnose issues in requests.

Finally, if an API request includes an `X-Base-Request-Id` header, it will be
logged as the `baseRequestId`. If that header is not set but the
`parentRequestId` is set then the `baseRequestId` will be assumed to be the
same request, and if that isn't set either, then `baseRequestId` will be set to
the current `requestId`. This request id is used to identify the originating
request across all compliant systems without having to trace through the parent
links.

[apollo-server]: https://www.apollographql.com/docs/apollo-server/
[cors]: https://www.w3.org/TR/cors/
[dataloader]: https://github.com/facebook/dataloader
[docker]: https://www.docker.com/
[docker-compose]: https://docs.docker.com/compose/
[eslint]: https://eslint.org/
[express]: http://expressjs.com/
[graphql]: https://graphql.org/
[nodejs]: https://nodejs.org/
[pgadmin]: https://www.pgadmin.org/
[postgres]: https://www.postgresql.org/
[sequelize]: https://sequelize.org/
[eslint-config-airbnb-base]: https://github.com/airbnb/javascript/tree/master/packages/eslint-config-airbnb-base
[winston]: https://github.com/winstonjs/winston
