import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';

// Routes
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import depositRoutes from './routes/deposits';
import adminRoutes from './routes/admin';
import withdrawalRoutes from './routes/withdrawals';
import walletRoutes from './routes/wallet';

// Middleware
import { errorHandler, notFound } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';

const app = express();

// Trust proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Simplified CORS - Allow all origins in development
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
  optionsSuccessStatus: 200 // For legacy browser support
}));

// Handle preflight requests
app.options('*', cors());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Compression
app.use(compression());

// Data sanitization
app.use(mongoSanitize());

// Prevent parameter pollution
app.use(hpp());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
app.use(generalLimiter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/deposits', depositRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/wallet', walletRoutes);

// 404 handler
app.use('*', notFound);

// Error handler
app.use(errorHandler);

export default app;
