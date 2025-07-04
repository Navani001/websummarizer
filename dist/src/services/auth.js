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
exports.Login = Login;
exports.LoginCre = LoginCre;
const jwt_1 = __importDefault(require("../middleware/jwt"));
const prisma_1 = __importDefault(require("../lib/prisma"));
function Login(data) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!data) {
            console.log("No data provided");
            return { message: "Email is required", data: null };
        }
        try {
            console.log(data);
            const user = yield prisma_1.default.login.findFirst({ where: { email: data.email } });
            console.log(user);
            const accessToken = jwt_1.default.jwt.sign({ payload: { id: user === null || user === void 0 ? void 0 : user.id, name: user === null || user === void 0 ? void 0 : user.name, email: user === null || user === void 0 ? void 0 : user.email } });
            if (user == null) {
                return { message: "Login falied", data: null };
            }
            return { message: "Login successful", data: { user: user, token: accessToken } };
        }
        catch (err) {
            return { message: "Login successful", data: null };
        }
    });
}
function LoginCre(data) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!data) {
            console.log("No data provided");
            return { message: "Email is required", data: null };
        }
        try {
            console.log(data);
            const user = yield prisma_1.default.login.findFirst({ where: { email: data.email, password: data.password } });
            console.log(user);
            const accessToken = jwt_1.default.jwt.sign({ payload: { id: user === null || user === void 0 ? void 0 : user.id, name: user === null || user === void 0 ? void 0 : user.name, email: user === null || user === void 0 ? void 0 : user.email } });
            if (user == null) {
                return { message: "Login falied", data: null };
            }
            return { message: "Login successful", data: { user: user, token: accessToken } };
        }
        catch (err) {
            return { message: "Login successful", data: null };
        }
    });
}
