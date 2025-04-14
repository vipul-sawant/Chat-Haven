import fs from "fs";
import path from "path";

import { config } from "dotenv";
// config();

const mode = process.env.NODE_ENV || "development";

if (mode === "development") {
    const basePath = process.cwd();

    const possibleFiles = [
        `.env.${mode}.local`,
        `.env.${mode}`,
        `.env`
    ];

    const envFile = possibleFiles
        .map(file => path.resolve(basePath, file))
        .find(fs.existsSync);

    if (envFile) {
        config({ path: envFile });
        console.log(`Loaded environment from: ${path.basename(envFile)}`);
    } else {
        console.warn("No environment file found for development mode.");
    }

    // const localPath = path.resolve(process.cwd(), `.env.${mode}.local`);
    // const fallbackPath = path.resolve(process.cwd(), `.env.${mode}`);

    // const envFile = fs.existsSync(localPath) ? localPath : fallbackPath;
    // config({ path: envFile });

}

import e, { json, urlencoded, static as static_ } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

// Import routes at the top (ESM does not support imports inside functions)
import AuthRoutes from "./routes/auth.routes.js";
import ContactsRoutes from "./routes/contacts.routes.js";
import ChatRoutes from "./routes/chat.routes.js";
import OtpRoutes from "./routes/otp.routes.js";

const initApp = (io) => {    

    const app = e();

    const corsOptions = {
        credentials:true,
        origin: process.env.CORS_ORIGIN
    };

    console.log('corsOptions :', corsOptions);

    const jsonOptions = {
        limit: "16kb"
    };

    const urlEncodedOptions = {
        extended: true,
        limit: "16kb"
    };

    app.use(cors(corsOptions));

    app.use(json(jsonOptions));
    app.use(urlencoded(urlEncodedOptions));
    app.use(static_('public'));

    app.use(cookieParser());

    app.use((req, _, next) => {
        if (req.originalUrl.startsWith("/socket.io")) {
            return next(); // ⛔️ skip Express error handling for Socket.IO
          }
        const fullURL = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
        console.log(`🛠 Request received: ${fullURL}`);
        next();
    });
        
    // ✅ Attach io BEFORE routes
    app.use((req, res, next) => {
        if (req.originalUrl.startsWith("/socket.io")) {
              return next(); // skip adding req.io or sending any response
            }
        
        // Safe to attach io here for REST APIs
        console.log("✅ Middleware Executing:", req.originalUrl);
        req.io = io;
        next();
        console.log("✅ req.io middleware executed");
  
    });

    app.use('/api/v1/auth', AuthRoutes);
    app.use('/api/v1/contacts', ContactsRoutes);
    app.use('/api/v1/chats', ChatRoutes);
    app.use('/api/v1/otp', OtpRoutes);

    return app;
};

export default initApp;