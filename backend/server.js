const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const connectDB = require('./config/db');
const walletRoutes = require('./routes/wallet');
const adminRoutes = require('./routes/admin');
const swapRoutes = require('./routes/swapRoutes');

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

// ✅ Session config: rolling expiration!
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true, // ✅ extend session with each request
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions',
  }),
  cookie: {
    maxAge: 30 * 60 * 1000, // 30 mins inactivity timeout
    httpOnly: true,
    secure: false, // true if using HTTPS
    sameSite: 'lax',
  },
}));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/wallet', walletRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/wallet/swap', swapRoutes);




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
