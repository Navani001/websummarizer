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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginUser = LoginUser;
exports.LoginUserCre = LoginUserCre;
const auth_1 = require("../services/auth");
function LoginUser(req, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email } = req.body;
        try {
            // Call the Login function
            const result = yield (0, auth_1.Login)({ email });
            // If login was successful
            if (result.data) {
                // Send success response
                return reply.status(200).send({
                    success: true,
                    message: 'Login successful',
                    data: result.data
                });
            }
            else {
                // If there was an error during login
                return reply.status(401).send({
                    success: false,
                    message: 'Login failed',
                    error: 'Invalid credentials'
                });
            }
        }
        catch (error) {
            // Handle any unexpected errors
            return reply.status(500).send({
                success: false,
                message: 'Server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
}
function LoginUserCre(req, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email, password } = req.body;
        try {
            // Call the Login function
            const result = yield (0, auth_1.LoginCre)({ email, password });
            // If login was successful
            if (result.data) {
                // Send success response
                return reply.status(200).send({
                    success: true,
                    message: 'Login successful',
                    data: result.data
                });
            }
            else {
                // If there was an error during login
                return reply.status(401).send({
                    success: false,
                    message: 'Login failed',
                    error: 'Invalid credentials'
                });
            }
        }
        catch (error) {
            // Handle any unexpected errors
            return reply.status(500).send({
                success: false,
                message: 'Server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
}
