import React, { useState } from 'react';  // ✅ 1) Add useState
import { useNavigate } from 'react-router-dom';  // ✅ 2) Add useNavigate
import MarketWidget from '../components/Market/MarketWidget';
import LivePricesTicker from '../components/Market/LivePricesTicker';

export default function LandingPage() {
  const [email, setEmail] = useState('');           // ✅ Local state for input
  const navigate = useNavigate();                   // ✅ Router hook

  // ✅ Handle Get Started submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      navigate(`/register?email=${encodeURIComponent(email.trim())}`);
    } else {
      alert('Please enter your email.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-black">
      <main className="flex-1">
        {/* ✅ 1) Hero Header */}
        <header className="relative bg-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-16 text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-4">
              Trade Crypto with Confidence
            </h1>
            <p className="text-base md:text-lg max-w-2xl mx-auto text-gray-600">
              Whitestone Capital is your gateway to secure, fast, and trusted crypto trading.
            </p>
          </div>
        </header>

        {/* ✅ 2) Live Ticker */}
        <section className="bg-gray-800 text-white py-2">
          <LivePricesTicker />
        </section>

        {/* ✅ 3) Trust & Stats */}
        <section className="py-12 px-4 text-center">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h2 className="text-4xl font-bold">150M+</h2>
              <p className="text-gray-600">Registered Users</p>
            </div>
            <div>
              <h2 className="text-4xl font-bold">500+</h2>
              <p className="text-gray-600">Cryptocurrencies</p>
            </div>
            <div>
              <h2 className="text-4xl font-bold">24/7</h2>
              <p className="text-gray-600">Secure & Live Support</p>
            </div>
          </div>
        </section>

        {/* ✅ 4) Hero Split: Left = background image + form, Right = MarketWidget */}
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="relative w-full max-w-md mx-auto min-h-[450px] ml-[-50px]">
              {/* ✅ Background image */}
              <img
                src="/images/LandingPage3D.png"
                alt="Crypto 3D Illustration"
                className="absolute inset-0 w-full h-full object-contain z-0 drift"
              />

              {/* ✅ Updated Input field + submit */}
              <form
                onSubmit={handleSubmit}   // ✅ Added submit handler
                className="absolute left-1/2 top-[85%] transform -translate-y-1/2 translate-x-[10%] flex w-[90%] max-w-md bg-white border border-black/20 rounded-full shadow-2xl p-1 z-10"
              >
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}                      // ✅ bind value
                  onChange={(e) => setEmail(e.target.value)}  // ✅ bind onChange
                  className="flex-grow px-4 py-2 rounded-l-full focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-full font-semibold"
                >
                  Get Started
                </button>
              </form>
            </div>

            {/* ✅ RIGHT SIDE */}
            <div className="ml-[10px]">
              <MarketWidget />
            </div>
          </div>
        </section>

        {/* ✅ 5) Feature Grid */}
        <section className="bg-gray-50 py-12 px-4">
          <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: 'Spot Trading', desc: 'Instant buys & sells.' },
              { title: 'Futures', desc: 'Advanced trading with leverage.' },
              { title: 'Earn', desc: 'Staking & Savings products.' },
              { title: 'NFT Marketplace', desc: 'Discover, buy, and sell NFTs.' },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition"
              >
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ✅ 6) Announcements */}
        <section className="bg-yellow-100 py-3 px-4">
          <div className="w-full flex justify-center space-x-6">
            {[
              'Welcome bonus: up to $100 in credits!',
              'New crypto listing: WHIT',
              'Get started: zero-fee trading!',
            ].map((msg, i) => (
              <span
                key={i}
                className="whitespace-nowrap text-gray-800 font-medium"
              >
                {msg}
              </span>
            ))}
          </div>
        </section>
      </main>

      {/* ✅ Sticky Footer */}
      <footer className="text-center text-sm py-6 border-t">
        &copy; 2025 Whitestone Capital — Secure Your Future.
      </footer>
    </div>
  );
}
