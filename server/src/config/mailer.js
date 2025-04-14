import fs from "fs";
import path from "path";

import { config } from "dotenv";

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

}

import nodemailer from "nodemailer";

// 📌 Configure Email Transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.USER_EMAIL,  // 🔹 Stored in .env
        pass: process.env.EMAIL_PASS   // 🔹 Stored in .env
    }
});

// ✅ Export Transporter for Reuse
export default transporter;
