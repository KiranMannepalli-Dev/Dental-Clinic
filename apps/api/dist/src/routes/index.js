"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const appointments_1 = __importDefault(require("./public/appointments"));
const doctors_1 = __importDefault(require("./public/doctors"));
const services_1 = __importDefault(require("./public/services"));
const auth_1 = __importDefault(require("./admin/auth"));
const dashboard_1 = __importDefault(require("./admin/dashboard"));
const appointments_2 = __importDefault(require("./admin/appointments"));
const router = (0, express_1.Router)();
// Public routes
router.use('/public/appointments', appointments_1.default);
router.use('/public/doctors', doctors_1.default);
router.use('/public/services', services_1.default);
// Admin routes
router.use('/admin/auth', auth_1.default);
router.use('/admin/dashboard', dashboard_1.default);
router.use('/admin/appointments', appointments_2.default);
exports.default = router;
