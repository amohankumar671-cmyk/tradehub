import React, { useState, useEffect, useCallback } from 'react';

const WORKER_URL = 'https://tradehub-server-production.up.railway.app';
const SYMBOLS = ['NIFTY', 'BANKNIFTY', 'FINNIFTY', 'MIDCPNIFTY'];

const SIGNAL_STYLES = {
  'Long Buildup':   { bg: '#0d2e1a', text: '#22c55e', border: '#16a34a', badge: '#15803d' },
  'Short Buildup':  { bg: '#2e0d0d', text: '#ef4444', border: '#dc2626', badge: '#b91c1c' },
  'Short Covering': { bg: '#0d1e2e', text: '#60a5fa', border: '#2563eb', badge: '#1d4ed8' },
  'Long Unwinding': { bg: '#2e1e0d', text: '#f97316', border: '#ea580c', badge: '#c2410c' },
  'Neutral':        { bg: '#1a1a1a', text: '#9ca3af', border: '#4b5563', badge: '#374151' },
};

const FILTER_SIGNALS = ['All', 'Long Buildup', 'Short Buildup', 'Short Covering', 'Long Unwinding', 'Neutral'];

export default function OIAnalysisPage() {
  const [symbol, setSymbol] = useState('NIFTY');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All'); // CE / PE / All
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [sortBy, setSortBy] = useState('strike');
  const [sortDir, setSortDir] = useState('asc');

  const fetchData = useCallback(async (sym) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${WORKER_URL}/oi?symbol=${sym}`);
      const json = await res.json();
      setData(json);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to fetch OI data: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(symbol);
  }, [symbol, fetchData]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => fetchData(symbol), 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, symbol, fetchData]);

  const handleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const filteredRows = (data?.rows || [])
    .filter(r => filter === 'All' || r.signal === filter)
    .filter(r => typeFilter === 'All' || r.type === typeFilter)
    .sort((a, b) => {
      let av = a[sortBy], bv = b[sortBy];
      if (typeof av === 'string') av = av.toLowerCase(), bv = bv.toLowerCase();
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });

  // Signal summary counts
  const summary = (data?.rows || []).reduce((acc, r) => {
    acc[r.signal] = (acc[r.signal] || 0) + 1;
    return acc;
  }, {});

  const SortIcon = ({ col }) => (
    <span style={{ marginLeft: 4, opacity: sortBy === col ? 1 : 0.3, fontSize: 10 }}>
      {sortBy === col ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
    </span>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e2e8f0', fontFamily: "'Inter', sans-serif", padding: '24px 16px' }}>

      {/* Header */}
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              OI Analysis
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
              Open Interest · Long Buildup · Short Covering · Signals
            </p>
          </div>

          {data && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9' }}>
                ₹{data.underlyingValue?.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                {symbol} · {data.nearExpiry}
              </div>
            </div>
          )}
        </div>

        {/* Mock warning */}
        {data?.isMock && (
          <div style={{ background: '#2d1f00', border: '1px solid #f59e0b', borderRadius: 8, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: '#fbbf24' }}>
            ⚠️ {data.mockNote}
          </div>
        )}

        {/* Controls Row */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Symbol Selector */}
          <div style={{ display: 'flex', gap: 6 }}>
            {SYMBOLS.map(s => (
              <button key={s} onClick={() => setSymbol(s)} style={{
                padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                background: symbol === s ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#1e1e2e',
                color: symbol === s ? '#fff' : '#94a3b8',
                transition: 'all 0.2s',
              }}>{s}</button>
            ))}
          </div>

          <div style={{ flex: 1 }} />

          {/* Auto Refresh */}
          <button onClick={() => setAutoRefresh(v => !v)} style={{
            padding: '7px 14px', borderRadius: 8, border: `1px solid ${autoRefresh ? '#22c55e' : '#334155'}`,
            background: autoRefresh ? '#0d2e1a' : '#1e1e2e', color: autoRefresh ? '#22c55e' : '#94a3b8',
            cursor: 'pointer', fontSize: 13, fontWeight: 600,
          }}>
            {autoRefresh ? '🔄 Live (30s)' : '⏸ Auto Refresh'}
          </button>

          {/* Manual Refresh */}
          <button onClick={() => fetchData(symbol)} disabled={loading} style={{
            padding: '7px 16px', borderRadius: 8, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontSize: 13, fontWeight: 600,
            opacity: loading ? 0.6 : 1,
          }}>
            {loading ? '⏳ Loading...' : '↻ Refresh'}
          </button>
        </div>

        {/* Signal Summary Cards */}
        {data && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
            {Object.entries(SIGNAL_STYLES).map(([sig, style]) => (
              <div key={sig} onClick={() => setFilter(filter === sig ? 'All' : sig)} style={{
                flex: '1 1 140px', padding: '12px 16px', borderRadius: 10,
                background: filter === sig ? style.bg : '#111827',
                border: `1px solid ${filter === sig ? style.border : '#1f2937'}`,
                cursor: 'pointer', transition: 'all 0.2s',
              }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: style.text }}>{summary[sig] || 0}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{sig}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filter Row */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: '#64748b' }}>Filter:</span>
          {FILTER_SIGNALS.map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: '5px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
              background: filter === s ? '#6366f1' : '#1e1e2e', color: filter === s ? '#fff' : '#94a3b8',
            }}>{s}</button>
          ))}
          <span style={{ fontSize: 13, color: '#64748b', marginLeft: 8 }}>Type:</span>
          {['All', 'CE', 'PE'].map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} style={{
              padding: '5px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
              background: typeFilter === t ? '#8b5cf6' : '#1e1e2e', color: typeFilter === t ? '#fff' : '#94a3b8',
            }}>{t}</button>
          ))}
          <span style={{ fontSize: 12, color: '#475569', marginLeft: 'auto' }}>
            {lastUpdated && `Updated: ${lastUpdated.toLocaleTimeString()}`}
          </span>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: '#2e0d0d', border: '1px solid #dc2626', borderRadius: 8, padding: '10px 16px', marginBottom: 16, color: '#ef4444', fontSize: 13 }}>
            ❌ {error}
          </div>
        )}

        {/* Table */}
        <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid #1f2937' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#111827', borderBottom: '1px solid #1f2937' }}>
                {[
                  { key: 'type',        label: 'Type'       },
                  { key: 'strike',      label: 'Strike'     },
                  { key: 'ltp',         label: 'LTP'        },
                  { key: 'priceChange', label: 'Chg'        },
                  { key: 'oi',          label: 'OI'         },
                  { key: 'oiChange',    label: 'OI Chg'     },
                  { key: 'volume',      label: 'Volume'     },
                  { key: 'iv',          label: 'IV %'       },
                  { key: 'signal',      label: 'Signal'     },
                ].map(col => (
                  <th key={col.key} onClick={() => handleSort(col.key)} style={{
                    padding: '12px 14px', textAlign: col.key === 'signal' ? 'center' : 'right',
                    color: '#94a3b8', fontWeight: 600, cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',
                    ...(col.key === 'type' || col.key === 'signal' ? { textAlign: 'center' } : {}),
                  }}>
                    {col.label}<SortIcon col={col.key} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 40, color: '#475569' }}>
                    {loading ? '⏳ Fetching data...' : 'No data found'}
                  </td>
                </tr>
              ) : filteredRows.map((row, i) => {
                const sStyle = SIGNAL_STYLES[row.signal] || SIGNAL_STYLES['Neutral'];
                return (
                  <tr key={i} style={{
                    background: i % 2 === 0 ? '#0d0d14' : '#0a0a0f',
                    borderBottom: '1px solid #1a1a2e',
                    transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = '#1a1a2e'}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#0d0d14' : '#0a0a0f'}
                  >
                    {/* Type badge */}
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                        background: row.type === 'CE' ? '#0d2e1a' : '#2e0d1a',
                        color: row.type === 'CE' ? '#22c55e' : '#f472b6',
                        border: `1px solid ${row.type === 'CE' ? '#166534' : '#9d174d'}`,
                      }}>{row.type}</span>
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: '#f1f5f9' }}>
                      {row.strike?.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', color: '#e2e8f0' }}>
                      {row.ltp?.toFixed(2)}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600, color: row.priceChange > 0 ? '#22c55e' : row.priceChange < 0 ? '#ef4444' : '#94a3b8' }}>
                      {row.priceChange > 0 ? '+' : ''}{row.priceChange?.toFixed(2)}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', color: '#e2e8f0' }}>
                      {row.oi?.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600, color: row.oiChange > 0 ? '#22c55e' : row.oiChange < 0 ? '#ef4444' : '#94a3b8' }}>
                      {row.oiChange > 0 ? '+' : ''}{row.oiChange?.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', color: '#94a3b8' }}>
                      {row.volume?.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', color: '#94a3b8' }}>
                      {row.iv?.toFixed(1)}%
                    </td>
                    {/* Signal badge */}
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                        background: sStyle.bg, color: sStyle.text, border: `1px solid ${sStyle.border}`,
                        whiteSpace: 'nowrap',
                      }}>{row.signal}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 12, fontSize: 12, color: '#374151', textAlign: 'center' }}>
          Showing {filteredRows.length} of {data?.total || 0} rows · Data source: NSE India
        </div>
      </div>
    </div>
  );
}
