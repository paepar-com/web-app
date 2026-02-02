'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [ticketId, setTicketId] = useState('');
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Function to Check Status
  const checkStatus = async () => {
    if (!ticketId) return;
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/orders/status/${ticketId}/`);
      const data = await res.json();
      
      if (res.ok) {
        setStatus({ type: 'success', data: data });
      } else {
        setStatus({ type: 'error', message: 'Ticket not found. Please check your ID.' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Connection error. Is the backend running?' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen max-w-md mx-auto bg-white shadow-xl overflow-hidden flex flex-col">
      
      {/* Header */}
      <header className="bg-blue-700 p-6 text-white pb-12 rounded-b-3xl shadow-lg relative z-10">
        <h1 className="text-2xl font-bold tracking-tight">Paepar</h1>
        <p className="text-blue-100 text-sm mt-1">Vehicle paperwork made simple.</p>
      </header>

      {/* Tracker Section (Floating Card) */}
      <div className="px-6 -mt-8 relative z-20">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Track Application
          </label>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Enter Ticket ID (e.g., PADI-9X2A)"
              className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none transition-all"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
            />
            <button 
              onClick={checkStatus}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl px-4 py-2 transition-colors disabled:opacity-50"
            >
              {loading ? '...' : 'Check'}
            </button>
          </div>

          {/* Status Result Display */}
          {status && (
            <div className={`mt-4 p-4 rounded-xl text-sm ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
              {status.type === 'success' ? (
                <div>
                  <p className="font-bold text-lg">{status.data.status}</p>
                  <p className="text-xs opacity-80 mt-1">Service: {status.data.service_type}</p>
                  <p className="text-xs opacity-80">Hello, {status.data.full_name}</p>
                </div>
              ) : (
                <p>{status.message}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Services List */}
      <div className="flex-1 p-6 pt-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Start New Request</h3>
        
        <div className="grid gap-4">
          <ServiceCard 
            title="Vehicle License Renewal" 
            desc="Renew your papers in 24 hours." 
            icon="🚗" 
            active 
          />
          <ServiceCard 
            title="Driver's License" 
            desc="New processing & renewals." 
            icon="🪪" 
          />
          <ServiceCard 
            title="Third Party Insurance" 
            desc="Instant insurance certificate." 
            icon="🛡️" 
          />
        </div>
      </div>

    </main>
  );
}

// Simple Sub-component for the buttons
function ServiceCard({ title, desc, icon, active = false }: any) {
  return (
    <Link href="/create">
      <div className={`p-4 rounded-2xl flex items-center gap-4 transition-all cursor-pointer border ${active ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-blue-200 bg-white'}`}>
        <div className="text-2xl bg-white w-12 h-12 rounded-full flex items-center justify-center shadow-sm">
          {icon}
        </div>
        <div>
          <h4 className="font-bold text-gray-800 text-sm">{title}</h4>
          <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
        </div>
      </div>
    </Link>
  );
}
