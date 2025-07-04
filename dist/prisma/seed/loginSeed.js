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
const prisma_1 = __importDefault(require("../../src/lib/prisma"));
const data = [
    {
        id: 1,
        name: "raj",
        email: "navaneethakrishnan.cs23@bitsathy.ac.in",
        logo: "ff",
        isDeleted: false,
        role: "admin",
        password: "123",
        updatedAt: new Date(),
        createdAt: new Date(),
    }, {
        id: 3,
        name: "raja",
        email: "navaneetha2006krishnan@gmail.com",
        logo: "ff",
        isDeleted: false,
        role: "police",
        password: "123",
        updatedAt: new Date(),
        createdAt: new Date(),
    },
    {
        id: 4,
        name: "system",
        email: "2006navaneethakrishnan@gmail.com",
        logo: "ff",
        isDeleted: false,
        role: "user",
        password: "123",
        updatedAt: new Date(),
        createdAt: new Date(),
    },
    {
        id: 2,
        name: "ram",
        email: "thiruselvan.cs23@bitsathy.ac.in",
        role: "police",
        logo: "ff",
        isDeleted: false,
        updatedAt: new Date(),
        createdAt: new Date(),
    }
];
function loginSeed() {
    return __awaiter(this, void 0, void 0, function* () {
        for (const record of data) {
            yield prisma_1.default.login.upsert({
                where: { id: record.id },
                create: record,
                update: record
            });
        }
    });
}
exports.default = loginSeed;
