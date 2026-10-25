import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { setupDatabase, testConnection } from './src/models/setup.js';

import { startSessionCleanup } from './src/utils/session-cleanup.js';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';

import routes from './src/controllers/routes.js';
import { addLocalVariables } from './src/middleware/global.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NODE_ENV =
    process.env.NODE_ENV?.toLowerCase() || 'production';

const PORT = process.env.PORT || 3000;

const app = express();

// Initialize PostgreSQL session store
const pgSession = connectPgSimple(session);

// Configure session middleware
app.use(session({
    store: new pgSession({
        conObject: {
            connectionString: process.env.DB_URL
        },
        tableName: 'session',
        createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: NODE_ENV.includes('dev') !== true,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Start automatic session cleanup
startSessionCleanup();

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Parse HTML form submissions and JSON request bodies.
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configure EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// Global middleware
app.use(addLocalVariables);

// Application routes
app.use('/', routes);

// 404 handler
app.use((req, res, next) => {
    const err = new Error('Page Not Found');
    err.status = 404;
    next(err);
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err);

    if (res.headersSent || res.finished) {
        return next(err);
    }

    const status = err.status || 500;
    const isProduction = NODE_ENV === "production";
    const template = status === 404 ? "404" : "500";

    const context = {
        title: status === 404 ? "Page Not Found" : "Server Error",
        error: isProduction ? "An error occurred." : err.message,
        stack: isProduction ? null : err.stack,
        NODE_ENV
    };

    try {
        res.status(status).render(`errors/${template}`, context);
    } catch (renderError) {
        console.error(renderError);

        if (!res.headersSent) {
            res.status(status).send(`
                <h1>Error ${status}</h1>
                <p>An error occurred.</p>
            `);
        }
    }
});

// Development WebSocket server
if (NODE_ENV.includes('dev')) {
    const ws = await import('ws');

    try {
        const wsPort = parseInt(PORT) + 1;
        const wsServer = new ws.WebSocketServer({
            port: wsPort
        });

        wsServer.on('listening', () => {
            console.log(
                `WebSocket server is running on port ${wsPort}`
            );
        });

        wsServer.on('error', error => {
            console.error('WebSocket server error:', error);
        });
    } catch (error) {
        console.error(
            'Failed to start WebSocket server:',
            error
        );
    }
}

// Start server
app.listen(PORT, async () => {
    await setupDatabase();
    await testConnection();
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});
