"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const cookie_1 = __importDefault(require("@fastify/cookie"));
const cors_1 = __importDefault(require("@fastify/cors"));
const fastify = (0, fastify_1.default)();
// Register the cookie plugin first
fastify.register(cookie_1.default, {
    secret: process.env.COOKIE_SECRET || 'some-secret-key',
    hook: 'onRequest', // Change to onRequest to ensure cookies are parsed early
});
fastify.register(cors_1.default, {
    origin: true, // Be careful in production - specify exact origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', ''],
    credentials: true
});
// Then register the JWT plugin
fastify.register(jwt_1.default, {
    secret: process.env.JWT_SECRET || 'imvinojan02061999xxxx',
    cookie: {
        cookieName: 'access_token',
        signed: false // Set to true if you want signed cookies
    }
});
fastify.decorate('authenticate', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = request.headers['authorization'];
        console.log(token);
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
    }
    catch (err) {
        console.error('Authentication error:', err);
        reply.code(401).send({
            error: 'Unauthorized',
            message: 'Invalid or expired token'
        });
    }
}));
exports.default = fastify;
