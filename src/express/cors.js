import expressCors from 'cors';

const cors = expressCors({
  credentials: true,
  methods: ['GET', 'HEAD', 'POST'],
  origin: process.env.API_CORS_ALLOWED_ORIGINS
    ? process.env.API_CORS_ALLOWED_ORIGINS.split(',')
    : false,
});

export default cors;
