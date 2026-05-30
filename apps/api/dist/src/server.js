"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
if (process.env.NODE_ENV !== 'production') {
    const envPath = fs_1.default.existsSync(path_1.default.resolve(__dirname, '../.env'))
        ? path_1.default.resolve(__dirname, '../.env')
        : path_1.default.resolve(__dirname, '../../.env');
    dotenv_1.default.config({ path: envPath });
}
const app_1 = __importDefault(require("./app"));
const database_1 = require("./config/database");
const PORT = process.env.PORT || 4000;
async function startServer() {
    const server = app_1.default.listen(PORT, () => {
        console.log(`✅ Server running on http://localhost:${PORT} [${process.env.NODE_ENV || 'development'}]`);
    });
    // Verify database connection (non-blocking — server starts regardless)
    database_1.prisma.$connect()
        .then(() => console.log('✅ Database connected'))
        .catch((err) => console.warn(`⚠️  Database unavailable: ${err.message}\n   Start PostgreSQL or update DATABASE_URL in apps/api/.env`));
    // Handle graceful shutdown
    const shutdown = async () => {
        console.log('\nShutting down...');
        server.close(async () => {
            await database_1.prisma.$disconnect();
            process.exit(0);
        });
    };
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
}
startServer();
