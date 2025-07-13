// src/components/Market/CandlestickChart.tsx
import React, { useEffect, useRef } from 'react';

export default function CandlestickChart() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (container.current && (window as any).TradingView) {
        new (window as any).TradingView.widget({
          container_id: container.current.id,
          autosize: true,
          symbol: 'BINANCE:BTCUSDT',
          interval: '30',
          timezone: 'Etc/UTC',
          theme: 'light',
          style: '1',
          locale: 'en',
          toolbar_bg: '#f1f3f6',
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          details: true,
          studies: [],
        });
      }
    };
    document.head.appendChild(script);
  }, []);

  return <div id="tradingview_chart" ref={container} style={{ height: '500px' }} />;
}
