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

type LeadStatus = 'new' | 'contacted' | 'interested' | 'pass';

interface SavedLead {
  business: Business;
  status: LeadStatus;
  savedAt: string;
}

interface SiteCheck {
  https?: boolean;
  hasMobileViewport?: boolean;
  hasResponsive?: boolean;
  oldTech?: boolean;
  copyrightYear?: number | null;
  score?: 'good' | 'outdated' | 'poor';
  error?: string;
}

type Tab = 'search' | 'saved';

function leadKey(b: Business) {
  return `${b.name}|${b.lat}|${b.lon}`;
}

function mapsUrl(b: Business) {
  const q = b.address ? `${b.name} ${b.address}` : b.name;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

function buildEmail(business: Business, check?: SiteCheck): { subject: string; body: string } {
  const name = business.name;
  const area = business.address?.split(',').slice(-2).join(',').trim() ?? 'your area';

  if (!business.website) {
    return {
      subject: `Professional website for ${name}`,
      body: `Hi there,\n\nI came across ${name} and noticed you don't currently have a website. A professional online presence makes a huge difference for local businesses in ${area} — especially for attracting new customers who search online first.\n\nI'm a UK-based web designer who builds clean, mobile-friendly websites at affordable prices. I'd love to put together a free quote for you.\n\nWould you be open to a quick chat?\n\nKind regards,\n[Your Name]\nkodedev.co.uk`,
    };
  }

  const issues = [];
  if (check && !check.error) {
    if (!check.https) issues.push('no HTTPS security');
    if (!check.hasMobileViewport) issues.push('not mobile-friendly');
    if (check.oldTech) issues.push('outdated technology');
    if (check.copyrightYear && check.copyrightYear < 2021) issues.push(`last updated around ${check.copyrightYear}`);
  }
  const issueText = issues.length > 0 ? ` — specifically it appears ${issues.join(' and ')}` : '';

  return {
    subject: `Website refresh for ${name}`,
    body: `Hi there,\n\nI was looking at local businesses in ${area} and checked out the ${name} website. It looks like it could benefit from a modern refresh${issueText}.\n\nI specialise in redesigning websites to improve speed, mobile experience, and conversions. I'm happy to offer a free, no-obligation review of your current site.\n\nWould that be of interest?\n\nKind regards,\n[Your Name]\nkodedev.co.uk`,
  };
}

function EmailModal({ business, check, onClose }: { business: Business; check?: SiteCheck; onClose: () => void }) {
  const { subject, body } = buildEmail(business, check);
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">Email Template</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition text-lg leading-none">✕</button>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-400 mb-1">Subject</p>
            <p className="text-sm text-white bg-gray-800 rounded-lg px-3 py-2">{subject}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Body</p>
            <pre className="text-sm text-white bg-gray-800 rounded-lg px-3 py-3 whitespace-pre-wrap font-sans leading-relaxed max-h-64 overflow-y-auto">{body}</pre>
          </div>
        </div>
        <button
          onClick={copy}
          className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-lg transition"
        >
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </button>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(true);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('search');

  const [location, setLocation] = useState('');
  const [osmTag, setOsmTag] = useState(OSM_TAGS[0].value);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const [siteChecks, setSiteChecks] = useState<Record<string, SiteCheck>>({});
  const [checkingKey, setCheckingKey] = useState<string | null>(null);

  const [savedLeads, setSavedLeads] = useState<SavedLead[]>(() => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem('kodedev_leads') || '[]'); } catch { return []; }
  });

  const [emailModal, setEmailModal] = useState<{ business: Business; check?: SiteCheck } | null>(null);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) { setAuthenticated(true); setPasswordError(false); }
    else setPasswordError(true);
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setBusinesses([]); setSearched(false); setSiteChecks({});
    if (!location.trim()) { setError('Please enter a location.'); return; }
    setLoading(true);
    try {
      const geoRes = await fetch(`${API_BASE}/api/geocode`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: location.trim() }),
      });
      if (!geoRes.ok) { const e = await geoRes.json(); throw new Error(e.error || 'Location not found'); }
      const geo = await geoRes.json();
      const bizRes = await fetch(`${API_BASE}/api/businesses`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: geo.lat, lon: geo.lon, osmTag }),
      });
      if (!bizRes.ok) { const e = await bizRes.json(); throw new Error(e.error || 'Failed to fetch businesses'); }
      const results: Business[] = await bizRes.json();
      results.sort((a, b) => (a.website ? 1 : 0) - (b.website ? 1 : 0));
      setBusinesses(results);
      setSearched(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function checkWebsite(url: string, key: string) {
    setCheckingKey(key);
    try {
      const res = await fetch(`${API_BASE}/api/check-website`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      setSiteChecks(prev => ({ ...prev, [key]: data }));
    } catch {
      setSiteChecks(prev => ({ ...prev, [key]: { error: 'unreachable' } }));
    } finally {
      setCheckingKey(null);
    }
  }

  function saveLead(business: Business) {
    const key = leadKey(business);
    setSavedLeads(prev => {
      if (prev.find(l => leadKey(l.business) === key)) return prev;
      const next = [...prev, { business, status: 'new' as LeadStatus, savedAt: new Date().toISOString() }];
      localStorage.setItem('kodedev_leads', JSON.stringify(next));
      return next;
    });
  }

  function updateLeadStatus(key: string, status: LeadStatus) {
    setSavedLeads(prev => {
      const next = prev.map(l => leadKey(l.business) === key ? { ...l, status } : l);
      localStorage.setItem('kodedev_leads', JSON.stringify(next));
      return next;
    });
  }

  function removeLead(key: string) {
    setSavedLeads(prev => {
      const next = prev.filter(l => leadKey(l.business) !== key);
      localStorage.setItem('kodedev_leads', JSON.stringify(next));
      return next;
    });
  }

  function exportCSV() {
    const header = 'Name,Phone,Email,Website,Address,Google Maps';
    const rows = businesses.map(b =>
      [b.name, b.phone || '', b.email || '', b.website || '', b.address || '', mapsUrl(b)]
        .map(v => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    );
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `leads-${location.replace(/\s+/g, '-')}.csv`;
    a.click();
  }

  function BusinessCard({ b }: { b: Business }) {
    const key = leadKey(b);
    const check = siteChecks[key];
    const isSaved = savedLeads.some(l => leadKey(l.business) === key);
    const isChecking = checkingKey === key;

    return (
      <div className="px-5 py-4 hover:bg-gray-800/40 transition">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-white">{b.name}</span>
              {!b.website && (
                <span className="text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full">Not listed</span>
              )}
              {b.website && (
                <a href={b.website.startsWith('http') ? b.website : `https://${b.website}`} target="_blank" rel="noopener noreferrer"
                  className="text-xs bg-purple-900/50 text-purple-300 hover:text-purple-200 px-2 py-0.5 rounded-full transition truncate max-w-[200px]">
                  {b.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                </a>
              )}
            </div>
            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {b.phone && <a href={`tel:${b.phone}`} className="text-green-400 hover:text-green-300 transition">{b.phone}</a>}
              {b.email && <a href={`mailto:${b.email}`} className="text-blue-400 hover:text-blue-300 transition">{b.email}</a>}
              {!b.phone && !b.email && <span className="text-gray-600 text-xs">No contact info — use Maps</span>}
            </div>
            {b.address && <p className="text-gray-500 text-xs mt-1">{b.address}</p>}
            {check && !check.error && (
              <div className={`text-xs mt-1.5 flex gap-2 flex-wrap font-medium ${check.score === 'good' ? 'text-green-400' : check.score === 'outdated' ? 'text-yellow-400' : 'text-red-400'}`}>
                <span>{check.score?.toUpperCase()}</span>
                {!check.https && <span>· No HTTPS</span>}
                {!check.hasMobileViewport && <span>· Not mobile-friendly</span>}
                {check.oldTech && <span>· Old tech</span>}
                {check.copyrightYear && check.copyrightYear < 2021 && <span>· ©{check.copyrightYear}</span>}
              </div>
            )}
            {check?.error && <p className="text-xs text-red-400 mt-1">Site unreachable</p>}
          </div>
          <div className="flex flex-col gap-1.5 shrink-0">
            <a href={mapsUrl(b)} target="_blank" rel="noopener noreferrer"
              className="text-center text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg transition">
              Maps
            </a>
            {b.website && (
              <button onClick={() => checkWebsite(b.website!, key)} disabled={isChecking}
                className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition disabled:opacity-50">
                {isChecking ? '...' : check ? 'Re-check' : 'Check'}
              </button>
            )}
            <button onClick={() => saveLead(b)} disabled={isSaved}
              className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition disabled:opacity-40">
              {isSaved ? 'Saved' : 'Save'}
            </button>
            <button onClick={() => setEmailModal({ business: b, check })}
              className="text-xs bg-purple-800/60 hover:bg-purple-700/60 border border-purple-700/50 text-purple-300 px-3 py-1.5 rounded-lg transition">
              Email
            </button>
          </div>
        </div>
      </div>
    );
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
              <input type="password" value={passwordInput}
                onChange={e => { setPasswordInput(e.target.value); setPasswordError(false); }}
                placeholder="Enter password" autoFocus
                className={`w-full bg-gray-800 text-white border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 transition ${passwordError ? 'border-red-500' : 'border-gray-700'}`}
              />
              {passwordError && <p className="text-red-400 text-sm mt-1">Incorrect password.</p>}
            </div>
            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition">Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="border-b border-gray-800 bg-gray-900 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Lead Finder</h1>
          <p className="text-gray-400 text-xs mt-0.5">Kodedev Admin</p>
        </div>
        <button onClick={() => setAuthenticated(false)} className="text-gray-500 hover:text-gray-300 text-sm transition">Logout</button>
      </div>

      <div className="flex gap-0 border-b border-gray-800 bg-gray-900 px-6">
        {(['search', 'saved'] as Tab[]).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition capitalize ${activeTab === t ? 'border-purple-500 text-white' : 'border-transparent text-gray-400 hover:text-gray-200'}`}>
            {t === 'saved' ? `Saved (${savedLeads.length})` : 'Search'}
          </button>
        ))}
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {activeTab === 'search' && (<>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <input type="text" value={location} onChange={e => setLocation(e.target.value)}
                placeholder="Town or city (e.g. Manchester)"
                className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 transition" />
              <select value={osmTag} onChange={e => setOsmTag(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 transition sm:w-48">
                {OSM_TAGS.map(tag => <option key={tag.value} value={tag.value}>{tag.label}</option>)}
              </select>
              <button type="submit" disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-lg transition whitespace-nowrap">
                {loading ? 'Searching...' : 'Find Leads'}
              </button>
            </form>
            {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
          </div>

          {searched && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
                <h2 className="font-semibold text-white">
                  {businesses.length} businesses
                  <span className="text-gray-500 font-normal text-sm ml-2">near {location}</span>
                  {businesses.filter(b => !b.website).length > 0 && (
                    <span className="ml-2 text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">
                      {businesses.filter(b => !b.website).length} not listed
                    </span>
                  )}
                </h2>
                {businesses.length > 0 && (
                  <button onClick={exportCSV} className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition">
                    Export CSV
                  </button>
                )}
              </div>
              {businesses.length === 0
                ? <p className="text-gray-400 px-5 py-8">No businesses found.</p>
                : <div className="divide-y divide-gray-800">{businesses.map((b, i) => <BusinessCard key={i} b={b} />)}</div>
              }
            </div>
          )}
        </>)}

        {activeTab === 'saved' && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-800">
              <h2 className="font-semibold text-white">Saved Leads ({savedLeads.length})</h2>
            </div>
            {savedLeads.length === 0
              ? <p className="text-gray-400 px-5 py-8">No saved leads yet. Save businesses from the Search tab.</p>
              : (
                <div className="divide-y divide-gray-800">
                  {savedLeads.map((lead, i) => {
                    const key = leadKey(lead.business);
                    const statusColors: Record<LeadStatus, string> = {
                      new: 'text-gray-300',
                      contacted: 'text-blue-400',
                      interested: 'text-green-400',
                      pass: 'text-gray-500',
                    };
                    return (
                      <div key={i} className="px-5 py-4 flex items-center gap-3 flex-wrap sm:flex-nowrap">
                        <div className="min-w-0 flex-1">
                          <span className={`font-semibold ${statusColors[lead.status]}`}>{lead.business.name}</span>
                          {lead.business.address && <p className="text-gray-500 text-xs mt-0.5">{lead.business.address}</p>}
                          <p className="text-gray-600 text-xs">Saved {new Date(lead.savedAt).toLocaleDateString()}</p>
                        </div>
                        <select value={lead.status} onChange={e => updateLeadStatus(key, e.target.value as LeadStatus)}
                          className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-1.5 outline-none">
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="interested">Interested</option>
                          <option value="pass">Pass</option>
                        </select>
                        <a href={mapsUrl(lead.business)} target="_blank" rel="noopener noreferrer"
                          className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition">
                          Maps
                        </a>
                        <button onClick={() => setEmailModal({ business: lead.business })}
                          className="text-xs bg-purple-800/60 hover:bg-purple-700/60 border border-purple-700/50 text-purple-300 px-3 py-1.5 rounded-lg transition">
                          Email
                        </button>
                        <button onClick={() => removeLead(key)} className="text-xs text-gray-500 hover:text-red-400 transition">Remove</button>
                      </div>
                    );
                  })}
                </div>
              )}
          </div>
        )}
      </div>

      {emailModal && (
        <EmailModal business={emailModal.business} check={emailModal.check} onClose={() => setEmailModal(null)} />
      )}
    </div>
  );
}
