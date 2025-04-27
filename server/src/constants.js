export const cookieOptions = (action) => {
    const isProd = process.env.NODE_ENV === "production";
    const baseOptions = {
        httpOnly: true,
        secure: isProd,           // false for localhost, true for production
        sameSite: isProd ? "none" : "lax",  // "lax" works for localhost
    };

    if (action === "refreshToken") {
        baseOptions.expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
    }

    if (action === "accessToken") {
        baseOptions.expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 1);
    }

    if (action === "otp") {
        baseOptions.expires = new Date(Date.now() + 1000 * 60 * 10);
    }

    return baseOptions;
};
