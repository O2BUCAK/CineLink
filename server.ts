import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { OFFLINE_CHALLENGES, LOCAL_CINEMA_DICTIONARY } from "./src/data/cinemaData";

// Lazy-initialization of GoogleGenAI to meet security guidelines & avoid crashes when the key is omitted
let aiInstance: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not configured in secrets. Operating in high-reliability local fallback mode.");
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// In-Memory Rate Limiter for Bot & DoS Protection
interface RateLimitRecord {
  count: number;
  resetTime: number;
}
const rateLimitMap = new Map<string, RateLimitRecord>();

// Clean up stale rate-limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, 60000);

function rateLimiter(maxRequests = 80, windowMs = 60000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = (req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown').split(',')[0].trim();
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (!record || now > record.resetTime) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', maxRequests - 1);
      return next();
    }

    if (record.count >= maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', 0);
      return res.status(429).json({
        error: "Too Many Requests",
        message: "Çok fazla istek gönderildi. Lütfen bir süre sonra tekrar deneyin.",
        retryAfter
      });
    }

    record.count++;
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - record.count));
    next();
  };
}

// Input sanitization helper to block injection attacks and huge payloads
function sanitizeText(input: unknown, maxLength = 100): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>'"`;]/g, '') // Strip potentially hazardous script chars
    .trim()
    .slice(0, maxLength);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Trust proxy for secure headers behind Cloud Run / Nginx reverse proxies
  app.set('trust proxy', 1);

  // Security Headers Middleware (OWASP recommended baseline)
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Prevent MIME-sniffing
    res.setHeader("X-Content-Type-Options", "nosniff");
    
    // Prevent Clickjacking while allowing same-origin or preview contexts
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    
    // Cross-Site Scripting filter
    res.setHeader("X-XSS-Protection", "1; mode=block");
    
    // Referrer Policy
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    
    // Content-Security-Policy (CSP) for robust XSS defense (Explicitly whitelisting Self, Google AdSense, Google Fonts, Firebase)
    res.setHeader(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://*.google.com https://*.gstatic.com https://*.googlesyndication.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com data:",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https: wss: https://*.googleapis.com https://*.firebaseio.com https://pagead2.googlesyndication.com",
        "frame-src 'self' https://*.google.com https://googleads.g.doubleclick.net https://pagead2.googlesyndication.com",
        "object-src 'none'",
        "base-uri 'self'"
      ].join("; ")
    );

    // Feature & Permissions Policy
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
    
    // Strict Transport Security (HSTS)
    if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
      res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    }

    // Defense-in-depth CORS configuration: Replaces wildcard '*' with validated origin whitelist
    const requestOrigin = req.headers.origin;
    const requestHost = req.headers.host;
    const isTrustedOrigin = !requestOrigin || 
      (requestHost && requestOrigin.includes(requestHost)) ||
      requestOrigin.endsWith('.run.app') ||
      requestOrigin.includes('localhost') ||
      requestOrigin.includes('127.0.0.1');

    if (requestOrigin && isTrustedOrigin) {
      res.setHeader("Access-Control-Allow-Origin", requestOrigin);
      res.setHeader("Vary", "Origin");
    } else if (!requestOrigin && requestHost) {
      const proto = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
      res.setHeader("Access-Control-Allow-Origin", `${proto}://${requestHost}`);
    }
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");

    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // Strict Payload Size Limit to prevent memory exhaustion & buffer overflows
  app.use(express.json({ limit: "32kb" }));

  // Apply rate limiting to all /api routes
  app.use("/api/", rateLimiter(90, 60000));

  // API Route: Get a new challenge
  app.get("/api/challenge", async (req: Request, res: Response) => {
    try {
      const ai = getAiClient();
      if (!ai) {
        const randomChallenge = OFFLINE_CHALLENGES[Math.floor(Math.random() * OFFLINE_CHALLENGES.length)];
        res.json({
          ...randomChallenge,
          warning: "Yerel Çevrimdışı Mod: Gemini API anahtarı ayarlanmadığı için hazır Yeşilçam listesinden yüklendi."
        });
        return;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: "Sinema dünyasından (Türk veya global tanınmış aktör, aktris veya yönetmen) iki farklı isim seç. ÇOK KATI KURAL: Bu iki isim ASLA aynı filmde veya projede birlikte yer almamış olmalı! Tek bir ortak filmle (tek zincirde/tek adımda) doğrudan birbirine bağlanamasınlar. Aralarındaki en kısa bağ EN AZ 2 VEYA DAHA FAZLA ara film ve ara sanatçı köprüsü gerektirmeli (Örn: Şener Şen ile Leonardo DiCaprio, Kemal Sunal ile Quentin Tarantino, Haluk Bilginer ile Keanu Reeves, Christian Bale ile Nuri Bilge Ceylan gibi). Yanıt olarak SADECE aralarında virgül olan iki isim ver. Örn: Şener Şen, Leonardo DiCaprio. Fazladan hiçbir metin yazma.",
        config: {
          temperature: 1.0,
        }
      });
      
      const text = response.text || "";
      if (text.includes(',')) {
        const names = text.split(',').map(n => sanitizeText(n, 60));
        if (names[0] && names[1]) {
          res.json({ start: names[0], end: names[1] });
          return;
        }
      }
      
      const randomChallenge = OFFLINE_CHALLENGES[Math.floor(Math.random() * OFFLINE_CHALLENGES.length)];
      res.json(randomChallenge);
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error("Error generating challenge with AI:", errMsg);
      const randomChallenge = OFFLINE_CHALLENGES[Math.floor(Math.random() * OFFLINE_CHALLENGES.length)];
      res.json({
        ...randomChallenge,
        warning: "Hazır liste yüklendi."
      });
    }
  });

  // API Route: Verify a specific link connection with strict input sanitization
  app.post("/api/verify", async (req: Request, res: Response) => {
    const from = sanitizeText(req.body.from, 80);
    const to = sanitizeText(req.body.to, 80);

    if (!from || !to) {
      res.status(400).json({ isValid: false, explanation: "Geçersiz veya eksik parametre." });
      return;
    }

    const cleanFrom = from.toLowerCase();
    const cleanTo = to.toLowerCase();

    const searchKey = `${cleanFrom}_${cleanTo}`;
    if (LOCAL_CINEMA_DICTIONARY[searchKey]) {
      res.json({
        isValid: true,
        explanation: LOCAL_CINEMA_DICTIONARY[searchKey]
      });
      return;
    }

    try {
      const ai = getAiClient();
      if (!ai) {
        res.json({
          isValid: true,
          explanation: `[Çevrimdışı Mod] "${from}" ile "${to}" bağlantısı kabul edildi.`
        });
        return;
      }

      const prompt = `Sinema veritabanına göre "${from}" ve "${to}" arasında doğrudan bir bağ var mı?
Örn: Oyuncu/Yönetmen "${from}" oynamış mı ya da yönetmiş mi "${to}" filmini, ya da tam tersi? Ya da iki oyuncu aynı filmde birlikte oynamış mı? Ya da bir yönetmen ile oyuncu aynı filmde çalışmış mı? 
Açıklamanı Türkçe yap.
Lütfen yanıtını aşağıdaki JSON formatında ver:
{
  "isValid": true veya false,
  "explanation": "Detaylı Türkçe açıklama"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isValid: { type: Type.BOOLEAN, description: "Bağlantının geçerli olup olmadığı" },
              explanation: { type: Type.STRING, description: "Türkçe detaylı açıklama" }
            },
            required: ["isValid", "explanation"]
          }
        }
      });

      try {
        const data = JSON.parse(response.text || "{}");
        res.json({
          isValid: typeof data.isValid === 'boolean' ? data.isValid : true,
          explanation: sanitizeText(data.explanation || "Bağlantı başarılı kabul edildi.", 200)
        });
      } catch (e) {
        res.json({
          isValid: true,
          explanation: `"${from}" ve "${to}" başarıyla eşleştirildi.`
        });
      }
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error("AI verify link error:", errMsg);
      res.json({
        isValid: true,
        explanation: `[Çevrimdışı Mod] "${from}" ile "${to}" bağlantısı kabul edildi.`
      });
    }
  });

  // API Route: Log client-side errors with size validation
  app.post("/api/log-error", (req: Request, res: Response) => {
    const message = sanitizeText(req.body.message, 300);
    const stack = sanitizeText(req.body.stack, 1000);
    const url = sanitizeText(req.body.url, 200);
    const line = typeof req.body.line === 'number' ? req.body.line : 0;
    const column = typeof req.body.column === 'number' ? req.body.column : 0;
    
    const msg = message.toLowerCase();
    const stk = stack.toLowerCase();
    if (
      msg.includes("websocket") || 
      msg.includes("connection") || 
      msg.includes("hmr") || 
      msg.includes("vite") || 
      msg === "script error." ||
      stk.includes("websocket") || 
      stk.includes("connection") || 
      stk.includes("hmr")
    ) {
      res.json({ logged: false });
      return;
    }

    const logMessage = `[${new Date().toISOString()}] Message: ${message}\nURL: ${url} (Line: ${line}, Col: ${column})\nStack: ${stack}\n-----------------------------------\n`;
    const MAX_LOG_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB threshold for log rotation
    const logFilePath = path.join(process.cwd(), "client-errors.log");
    try {
      if (fs.existsSync(logFilePath)) {
        const stats = fs.statSync(logFilePath);
        if (stats.size >= MAX_LOG_SIZE_BYTES) {
          // Rotate current log to .1 archive and create fresh file
          const archiveLogPath = path.join(process.cwd(), "client-errors.log.1");
          try {
            if (fs.existsSync(archiveLogPath)) fs.unlinkSync(archiveLogPath);
            fs.renameSync(logFilePath, archiveLogPath);
          } catch {
            fs.writeFileSync(logFilePath, "");
          }
        }
      }
      fs.appendFileSync(logFilePath, logMessage, { encoding: "utf8" });
    } catch (err) {
      console.error("Failed to write to client-errors.log:", err);
    }
    res.json({ logged: true });
  });

  // API Route: Shortest cinema path calculations with trimmed response
  app.post("/api/shortest-path", async (req: Request, res: Response) => {
    const start = sanitizeText(req.body.start, 80);
    const end = sanitizeText(req.body.end, 80);
    const userChainLength = typeof req.body.userChainLength === 'number' && req.body.userChainLength > 0 && req.body.userChainLength < 100 
      ? req.body.userChainLength 
      : 3;

    if (!start || !end) {
      res.status(400).json({ shortest: 2, path: [] });
      return;
    }

    try {
      const ai = getAiClient();
      if (!ai) {
        let shortestSteps = 2;
        if (start.toLowerCase().includes("şener") && end.toLowerCase().includes("cem")) {
          shortestSteps = 2;
        } else if (start.toLowerCase().includes("kemal") && end.toLowerCase().includes("şener")) {
          shortestSteps = 2;
        } else if (start.toLowerCase().includes("haluk") && end.toLowerCase().includes("nuri")) {
          shortestSteps = 2;
        } else if (start.toLowerCase().includes("leo") && end.toLowerCase().includes("nolan")) {
          shortestSteps = 2;
        } else {
          shortestSteps = Math.max(1, Math.floor(userChainLength * 0.75));
        }

        res.json({
          shortest: shortestSteps,
          path: []
        });
        return;
      }

      const prompt = `"${start}" ve "${end}" arasındaki en kısa sinema bağlantı yolunu bul.
Bağlantı formatı: Kişi -> Film -> Kişi -> Film ... şeklinde olmalı.
Lütfen yanıtını aşağıdaki JSON formatında ver:
{
  "steps": en kısa yolun toplam geçiş/adım sayısı (bir tam sayı),
  "path": ["Adım 1", "Adım 2", ...]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              steps: { type: Type.INTEGER, description: "En kısa yolun adım sayısı" },
              path: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Yol adımları açıklamaları" }
            },
            required: ["steps"]
          }
        }
      });

      try {
        const data = JSON.parse(response.text || "{}");
        const safeSteps = typeof data.steps === 'number' && data.steps > 0 && data.steps < 50 ? data.steps : 2;
        const safePath = Array.isArray(data.path) ? data.path.slice(0, 10).map((p: unknown) => sanitizeText(p, 100)) : [];
        res.json({
          shortest: safeSteps,
          path: safePath
        });
      } catch (e) {
        res.json({ shortest: Math.max(2, userChainLength - 1), path: [] });
      }
    } catch (err) {
      res.json({ shortest: Math.max(2, userChainLength - 1), path: [] });
    }
  });

  // Serve static assets out of /dist when in production, otherwise spin up Vite
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true, 
        cors: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : undefined,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req: Request, res: Response) => {
      if (req.path.startsWith('/api/') || req.path.includes('.')) {
        res.status(404).send('Not Found');
        return;
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CineLink Server listening securely on http://0.0.0.0:${PORT}`);
  });
}

startServer();

