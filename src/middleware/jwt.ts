import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import fastifyJwt, { JWT } from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import cors from '@fastify/cors';
const fastify = Fastify();

// Define the types for request user property
declare module 'fastify' {
  interface FastifyRequest {
    jwt: JWT;
   
  }
  export interface FastifyInstance {
    authenticate: any
  }
}

// Register the cookie plugin first
fastify.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET || 'some-secret-key',
  hook: 'onRequest', // Change to onRequest to ensure cookies are parsed early
});
fastify.register(cors, {
  origin: true, // Be careful in production - specify exact origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization',''],
  credentials:true
});
// Then register the JWT plugin
fastify.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || 'imvinojan02061999xxxx',
  cookie: {
    cookieName: 'access_token',
    signed: false // Set to true if you want signed cookies
  }
});
fastify.decorate(
  'authenticate',
  async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const token = request.headers['authorization'];
      console.log(token)
      if (!token) {
        throw new Error('No token provided');
      }
       const access_token = token.split(' ')[1];
       if (!access_token) {
        throw new Error('No token provided');
      }
      // Verify the token
      const decoded = fastify.jwt.verify(access_token);
      
      // Set the user in the request
      request.user = decoded;
      
      // Log successful authentication
      console.log('User authenticated:', decoded);
      
    } catch (err) {
      console.error('Authentication error:', err);
      reply.code(401).send({ 
        error: 'Unauthorized', 
        message: 'Invalid or expired token' 
      });
    }
  }
);

export default fastify;