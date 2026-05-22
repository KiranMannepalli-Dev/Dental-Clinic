"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestId = void 0;
const uuid_1 = require("uuid");
const requestId = (req, res, next) => {
    req.id = (0, uuid_1.v4)();
    next();
};
exports.requestId = requestId;
