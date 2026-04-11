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
  address: string;
  lat: number;
  lon: number;
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

    if (!location.trim()) {
      setError('Please enter a location.');
      return;
    }

    setLoading(true);
    try {
      const geoRes = await fetch(`${API_BASE}/api/geocode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: location.trim() }),
      });

      if (!geoRes.ok) {
        const err = await geoRes.json();
        throw new Error(err.error || 'Location not found');
      }

      const geo = await geoRes.json();

      const bizRes = await fetch(`${API_BASE}/api/businesses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: geo.lat, lon: geo.lon, osmTag }),
      });

      if (!bizRes.ok) {
        const err = await bizRes.json();
        throw new Error(err.error || 'Failed to fetch businesses');
      }

      const data = await bizRes.json();
      setBusinesses(data);
      setSearched(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function exportCSV() {
    const header = 'Name,Website,Phone,Address';
    const rows = businesses.map(b =>
      [b.name, b.website || '', b.phone || '', b.address]
        .map(v => `"${v.replace(/"/g, '""')}"`)
        .join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `businesses-${location.replace(/\s+/g, '-')}.csv`;
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
                className={`w-full bg-gray-800 text-white border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 transition ${
                  passwordError ? 'border-red-500' : 'border-gray-700'
                }`}
                autoFocus
              />
              {passwordError && (
                <p className="text-red-400 text-sm mt-1">Incorrect password.</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition"
            >
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
          <h1 className="text-xl font-bold text-white">Business Scraper</h1>
          <p className="text-gray-400 text-xs mt-0.5">Kodedev Admin Dashboard</p>
        </div>
        <button
          onClick={() => setAuthenticated(false)}
          className="text-gray-500 hover:text-gray-300 text-sm transition"
        >
          Logout
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Search Form */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Search Businesses</h2>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Location (e.g. Manchester, UK)"
              className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
            <select
              value={osmTag}
              onChange={e => setOsmTag(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 transition min-w-[180px]"
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
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
          {error && (
            <p className="text-red-400 text-sm mt-3">{error}</p>
          )}
        </div>

        {/* Results */}
        {searched && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                Results <span className="text-gray-400 text-sm font-normal">({businesses.length} found)</span>
              </h2>
              {businesses.length > 0 && (
                <button
                  onClick={exportCSV}
                  className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
                >
                  Export CSV
                </button>
              )}
            </div>

            {businesses.length === 0 ? (
              <p className="text-gray-400">No businesses found for this location and category.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-800">
                      <th className="text-left py-2 pr-4 font-medium">Name</th>
                      <th className="text-left py-2 pr-4 font-medium">Phone</th>
                      <th className="text-left py-2 pr-4 font-medium">Website</th>
                      <th className="text-left py-2 font-medium">Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {businesses.map((b, i) => (
                      <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                        <td className="py-3 pr-4 font-medium text-white">{b.name}</td>
                        <td className="py-3 pr-4 text-gray-300">{b.phone || <span className="text-gray-600">—</span>}</td>
                        <td className="py-3 pr-4">
                          {b.website ? (
                            <a
                              href={b.website.startsWith('http') ? b.website : `https://${b.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-400 hover:text-purple-300 transition"
                            >
                              {b.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                            </a>
                          ) : (
                            <span className="text-gray-600">—</span>
                          )}
                        </td>
                        <td className="py-3 text-gray-300 text-xs">{b.address}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
