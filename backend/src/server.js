const express = require('express');
const { verifyConnection: verifyNeo4j } = require('./config/neo4j');
require('dotenv').config();

const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const PORT = process.env.PORT || 3000;
const authRoutes = require('./routes/auth.routes');
const postRoutes = require('./routes/post.routes');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const { initializeSockets } = require('./chatSocket');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
initializeSockets(io);

// 1. Middleware CORS - PHẢI ĐẶT ĐẦU TIÊN
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:5173', 
    'http://127.0.0.1:5173',
    /\.vercel\.app$/ // Cho phép tất cả các sub-domain của vercel.app
  ];
  const origin = req.headers.origin;
  
  const isAllowed = allowedOrigins.some(allowed => {
    if (allowed instanceof RegExp) return allowed.test(origin);
    return allowed === origin;
  });

  if (isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// 2. 🛡️ SECURITY: Bảo vệ HTTP Headers (Cấu hình lỏng cho Local Dev)
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false,
}));

// 🚦 SECURITY: Chặn Spam (100 request/15 phút)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.',
});
app.use('/v1', limiter);

// Middleware parse JSON body
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));


const errorMiddleware = require('./middlewares/errorMiddleware');

// Mount API routes
app.use('/v1/auth', authRoutes);
app.use('/v1/posts', postRoutes);
app.use('/v1/comments', require('./routes/comment.routes'));
app.use('/v1/users', require('./routes/userRoutes'));
app.use('/v1/jobs', require('./routes/jobRoutes')); // <-- Mounted jobRoutes
app.use('/v1/recruiter', require('./routes/recruiterRoutes'));
app.use('/v1/network', require('./routes/networkRoutes'));
app.use('/v1/chat', require('./routes/chatRoutes'));
app.use('/v1/companies', require('./routes/companyRoutes'));
app.use('/v1/notifications', require('./routes/notificationRoutes'));
app.use('/v1/ai', require('./routes/aiRoutes'));
app.use('/v1/admin', require('./routes/adminRoutes'));

// Global Error Handler (Phải đăng ký cuối cùng)
app.use(errorMiddleware);

const startServer = async () => {
  try {
    // Verify Database Connections
    await verifyNeo4j();

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      
      // CronJob: Dọn dẹp Notification cũ hơn 30 ngày (Chạy 24h/lần)
      const { deleteOldNotifications } = require('./repositories/notificationRepository');
      setInterval(async () => {
        try {
          const deleted = await deleteOldNotifications(30);
          console.log(`[CronJob] Deleted ${deleted} old notifications.`);
        } catch (e) {
          console.error('[CronJob] Failed to delete old notifications', e);
        }
      }, 24 * 60 * 60 * 1000);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
