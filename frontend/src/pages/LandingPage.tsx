import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  ArrowRight, 
  Shield, 
  TrendingUp, 
  Users, 
  Globe, 
  Zap, 
  Lock, 
  BarChart3,
  Smartphone,
  Monitor,
  CheckCircle,
  Star
} from 'lucide-react';
import MarketWidget from '../components/Market/MarketWidget';
import LivePricesTicker from '../components/Market/LivePricesTicker';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, 100]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      navigate(`/register?email=${encodeURIComponent(email.trim())}`);
    } else {
      alert('Please enter your email.');
    }
  };

  const features = [
    {
      icon: Shield,
      title: "Bank-Level Security",
      desc: "Your assets are protected with military-grade encryption and cold storage technology."
    },
    {
      icon: TrendingUp,
      title: "Advanced Trading Tools",
      desc: "Professional charts, indicators, and real-time market data to maximize your profits."
    },
    {
      icon: Zap,
      title: "Lightning Fast Execution",
      desc: "Execute trades in milliseconds with our high-performance matching engine."
    },
    {
      icon: Users,
      title: "24/7 Expert Support",
      desc: "Get help anytime from our dedicated team of crypto experts and specialists."
    }
  ];

  const stats = [
    { icon: Users, number: "150M+", label: "Registered Users" },
    { icon: Globe, number: "500+", label: "Cryptocurrencies" },
    { icon: Lock, number: "24/7", label: "Secure & Live Support" },
    { icon: BarChart3, number: "$2.8T+", label: "Trading Volume" }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Professional Trader",
      content: "The best crypto platform I've ever used. The advanced tools and real-time data have significantly improved my trading performance.",
      rating: 5
    },
    {
      name: "Mike Rodriguez",
      role: "Crypto Investor",
      content: "Security and ease of use are top-notch. I feel confident storing my digital assets here.",
      rating: 5
    },
    {
      name: "Emily Johnson",
      role: "DeFi Enthusiast",
      content: "Incredible platform with cutting-edge features. The mobile app is just as powerful as the desktop version.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white overflow-hidden">
      {/* Live Prices Ticker */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50">
        <LivePricesTicker />
      </div>

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28">
        {/* Background Elements */}
        <motion.div 
          style={{ y: y1 }}
          className="absolute top-0 left-0 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"
        />
        <motion.div 
          style={{ y: y2 }}
          className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
        />

        <div className="relative max-w-7xl mx-auto">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            {/* Content */}
            <div className="lg:col-span-6 xl:col-span-7">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50 }}
                transition={{ duration: 0.8 }}
                className="text-center lg:text-left"
              >
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight">
                  <span className="block">Trade Crypto</span>
                  <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Like a Pro
                  </span>
                </h1>
                
                <p className="mt-6 text-lg sm:text-xl lg:text-2xl text-slate-300 max-w-3xl mx-auto lg:mx-0">
                  Join millions of traders worldwide on the most trusted cryptocurrency exchange. 
                  Trade, invest, and earn with advanced tools and bank-level security.
                </p>

                {/* CTA Form */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="mt-10"
                >
                  <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto lg:mx-0">
                    <div className="flex-1">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="w-full px-6 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold text-white hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      Get Started
                      <ArrowRight size={20} />
                    </motion.button>
                  </form>
                  
                  <p className="mt-4 text-sm text-slate-400 text-center lg:text-left">
                    Join over 150M+ users worldwide • No credit card required
                  </p>
                </motion.div>

                {/* Trust Indicators */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isVisible ? 1 : 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="mt-12 flex flex-wrap items-center justify-center lg:justify-start gap-8"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-slate-300">SEC Regulated</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-slate-300">FDIC Insured</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-slate-300">ISO 27001</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* Market Widget */}
            <div className="mt-16 lg:mt-0 lg:col-span-6 xl:col-span-5">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 50 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="relative"
              >
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-2xl">
                  <MarketWidget />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 lg:py-20 bg-slate-800/30 backdrop-blur-sm border-y border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl mb-4">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-slate-300 text-sm lg:text-base">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Experience the most advanced cryptocurrency trading platform with institutional-grade security and professional tools.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300 h-full">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl mb-6 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-white">
                    {feature.title}
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Preview Section */}
      <section className="py-16 lg:py-24 bg-slate-800/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Trade Anywhere, Anytime
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Access your portfolio and trade cryptocurrencies seamlessly across all your devices.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <Monitor className="w-8 h-8 text-blue-400" />
                  <span className="text-xl font-semibold">Desktop Trading</span>
                </div>
                <div className="flex items-center gap-3">
                  <Smartphone className="w-8 h-8 text-purple-400" />
                  <span className="text-xl font-semibold">Mobile App</span>
                </div>
              </div>
              
              <ul className="space-y-4">
                {[
                  "Advanced charting tools and technical indicators",
                  "Real-time market data and price alerts",
                  "One-click trading and portfolio management",
                  "Secure wallet integration and cold storage",
                  "Professional API for algorithmic trading"
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-slate-300">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl p-8 backdrop-blur-sm border border-white/20">
                <img 
                  src="/public/images/LandingPage3D.png" 
                  alt="Trading Platform Preview" 
                  className="w-full h-auto rounded-xl shadow-2xl"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Trusted by Millions
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              See what our users have to say about their experience with our platform.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-300 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-sm text-slate-400">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Ready to Start Trading?
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Join millions of users who trust our platform. Create your account in minutes and start trading today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/register')}
                className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-slate-100 transition-all shadow-lg hover:shadow-xl"
              >
                Create Free Account
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all"
              >
                Sign In
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
