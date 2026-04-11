'use client';

import { useState } from 'react';

const API_BASE = 'https://api.kodedev.co.uk/scraper';
const ADMIN_PASSWORD = 'Danielle2786!';

const OSM_TAGS = [
  { label: 'Restaurants', value: 'amenity=restaurant' },
  { label: 'Cafes', value: 'amenity=cafe' },
  { label: 'Bars & Pubs', value: 'amenity=bar' },
  { label: 'Hair Salons', value: 'shop=hairdresser' },
  { label: 'Beauty Salons', value: 'shop=beauty' },
  { label: 'Gyms', value: 'leisure=fitness_centre' },
  { label: 'Dentists', value: 'amenity=dentist' },
  { label: 'Doctors', value: 'amenity=doctors' },
  { label: 'Hotels', value: 'tourism=hotel' },
  { label: 'Shops (General)', value: 'shop=yes' },
  { label: 'Supermarkets', value: 'shop=supermarket' },
  { label: 'Pharmacies', value: 'amenity=pharmacy' },
  { label: 'Estate Agents', value: 'office=estate_agent' },
  { label: 'Accountants', value: 'office=accountant' },
  { label: 'Lawyers', value: 'office=lawyer' },
];

interface Business {
  name: string;
  website: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  lat: number;
  lon: number;
}

function mapsUrl(b: Business) {
  if (b.address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.name + ' ' + b.address)}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.name)}&center=${b.lat},${b.lon}`;
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const [location, setLocation] = useState('');
  const [osmTag, setOsmTag] = useState(OSM_TAGS[0].value);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [noWebsiteOnly, setNoWebsiteOnly] = useState(false);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusinesses([]);
    setSearched(false);
    if (!location.trim()) { setError('Please enter a location.'); return; }
    setLoading(true);
    try {
      const geoRes = await fetch(`${API_BASE}/api/geocode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: location.trim() }),
      });
      if (!geoRes.ok) { const e = await geoRes.json(); throw new Error(e.error || 'Location not found'); }
      const geo = await geoRes.json();

      const bizRes = await fetch(`${API_BASE}/api/businesses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: geo.lat, lon: geo.lon, osmTag }),
      });
      if (!bizRes.ok) { const e = await bizRes.json(); throw new Error(e.error || 'Failed to fetch businesses'); }
      const results: Business[] = await bizRes.json();
      // Sort: no website first (hot leads), then with website
      results.sort((a, b) => (a.website ? 1 : 0) - (b.website ? 1 : 0));
      setBusinesses(results);
      setSearched(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function exportCSV() {
    const header = 'Name,Phone,Email,Website,Address,Google Maps';
    const rows = businesses.map(b =>
      [b.name, b.phone || '', b.email || '', b.website || '', b.address || '', mapsUrl(b)]
        .map(v => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${location.replace(/\s+/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white">Admin Access</h1>
            <p className="text-gray-400 text-sm mt-1">kodedev.co.uk</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={passwordInput}
                onChange={e => { setPasswordInput(e.target.value); setPasswordError(false); }}
                placeholder="Enter password"
                className={`w-full bg-gray-800 text-white border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 transition ${passwordError ? 'border-red-500' : 'border-gray-700'}`}
                autoFocus
              />
              {passwordError && <p className="text-red-400 text-sm mt-1">Incorrect password.</p>}
            </div>
            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Lead Finder</h1>
          <p className="text-gray-400 text-xs mt-0.5">Kodedev Admin</p>
        </div>
        <button onClick={() => setAuthenticated(false)} className="text-gray-500 hover:text-gray-300 text-sm transition">
          Logout
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Search */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Town or city (e.g. Manchester)"
              className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
            <select
              value={osmTag}
              onChange={e => setOsmTag(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 transition sm:w-48"
            >
              {OSM_TAGS.map(tag => (
                <option key={tag.value} value={tag.value}>{tag.label}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-lg transition whitespace-nowrap"
            >
              {loading ? 'Searching...' : 'Find Leads'}
            </button>
          </form>
          <div className="flex items-center gap-3 mt-3">
            <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-300">
              <input
                type="checkbox"
                checked={noWebsiteOnly}
                onChange={e => setNoWebsiteOnly(e.target.checked)}
                className="w-4 h-4 accent-purple-500"
              />
              Show potential clients only (no website)
            </label>
          </div>
          {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
        </div>

        {/* Results */}
        {searched && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            {(() => {
              const filtered = noWebsiteOnly ? businesses.filter(b => !b.website) : businesses;
              const hotCount = businesses.filter(b => !b.website).length;
              return (<>
            <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
              <h2 className="font-semibold text-white">
                {filtered.length} {noWebsiteOnly ? 'potential clients' : 'businesses'} found
                <span className="text-gray-500 font-normal text-sm ml-2">near {location}</span>
                {!noWebsiteOnly && hotCount > 0 && (
                  <span className="ml-2 text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">
                    {hotCount} with no website
                  </span>
                )}
              </h2>
              {filtered.length > 0 && (
                <button onClick={exportCSV} className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition">
                  Export CSV
                </button>
              )}
            </div>

            {filtered.length === 0 ? (
              <p className="text-gray-400 px-5 py-8">No results match. Try unchecking the filter.</p>
            ) : (
              <div className="divide-y divide-gray-800">
                {filtered.map((b, i) => (
                  <div key={i} className="px-5 py-4 hover:bg-gray-800/40 transition">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-white">{b.name}</span>
                          {!b.website && (
                            <span className="text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full">
                              No website
                            </span>
                          )}
                          {b.website && (
                            <a
                              href={b.website.startsWith('http') ? b.website : `https://${b.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs bg-purple-900/50 text-purple-300 hover:text-purple-200 px-2 py-0.5 rounded-full transition truncate max-w-[180px]"
                            >
                              {b.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                            </a>
                          )}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                          {b.phone && (
                            <a href={`tel:${b.phone}`} className="text-green-400 hover:text-green-300 transition">
                              {b.phone}
                            </a>
                          )}
                          {b.email && (
                            <a href={`mailto:${b.email}`} className="text-blue-400 hover:text-blue-300 transition">
                              {b.email}
                            </a>
                          )}
                          {!b.phone && !b.email && (
                            <span className="text-gray-600 text-xs">No contact info in database</span>
                          )}
                        </div>
                        {b.address && (
                          <p className="text-gray-500 text-xs mt-1">{b.address}</p>
                        )}
                      </div>
                      <a
                        href={mapsUrl(b)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg transition"
                      >
                        Maps
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>);})()}
          </div>
        )}
      </div>
    </div>
  );
}
