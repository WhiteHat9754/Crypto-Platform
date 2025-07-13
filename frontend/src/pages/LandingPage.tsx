// src/pages/LandingPage.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import LivePricesTicker from '../components/Market/LivePricesTicker';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-black">
      <main className="flex-1">
        <header className="relative bg-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-24 text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
              Trade Crypto with Confidence
            </h1>
            <p className="text-lg md:text-xl mb-6 max-w-2xl mx-auto">
              Whitestone Capital is your gateway to secure, fast, and trusted crypto trading.
            </p>
            <Link
              to="/register"
              className="bg-yellow-400 hover:bg-yellow-500 px-8 py-3 rounded-full font-semibold text-lg"
            >
              Get Started
            </Link>
          </div>
        </header>

        <section className="bg-gray-800 text-white py-2">
          <LivePricesTicker />
        </section>

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

        <section className="bg-gray-50 py-12 px-4">
          <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: 'Spot Trading', desc: 'Instant buys & sells.' },
              { title: 'Futures', desc: 'Advanced trading with leverage.' },
              { title: 'Earn', desc: 'Staking & Savings products.' },
              { title: 'NFT Marketplace', desc: 'Discover, buy, and sell NFTs.' },
            ].map((feature) => (
              <div key={feature.title} className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-yellow-100 py-3 px-4">
          <div className="max-w-7xl mx-auto flex overflow-x-auto space-x-6">
            {['Welcome bonus: up to $100 in credits!', 'New crypto listing: WHIT', 'Get started: zero-fee trading!'].map(
              (msg, i) => (
                <span key={i} className="whitespace-nowrap text-gray-800 font-medium">
                  {msg}
                </span>
              )
            )}
          </div>
        </section>
      </main>

      <footer className="text-center text-sm py-6 border-t">
        &copy; 2025 Whitestone Capital — Secure Your Future.
      </footer>
    </div>
  );
}
