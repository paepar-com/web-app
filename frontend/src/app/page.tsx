'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [ticketId, setTicketId] = useState('');
  const [statusResult, setStatusResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Clear result when input is empty
  const handleInputChange = (e: any) => {
    const val = e.target.value;
    setTicketId(val);
    if (val === '') setStatusResult(null); 
  };

  const checkStatus = async () => {
    if (!ticketId) return;
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/orders/status/${ticketId}/`);
      const data = await res.json();
      if (res.ok) setStatusResult({ success: true, data });
      else setStatusResult({ success: false, message: 'Ticket not found.' });
    } catch {
      setStatusResult({ success: false, message: 'Connection Error.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      
      {/* 1. HERO SECTION (Desktop Friendly) */}
      <div className="bg-blue-900 text-white py-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Paepar</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            The easiest way to process your Vehicle Papers, Driver's License, and Inspections in Nigeria.
          </p>
        </div>
      </div>

      {/* 2. MAIN ACTIONS (The Split) */}
      <div className="max-w-4xl mx-auto px-6 -mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-12">
        
        {/* CAR OWNER CARD */}
        <Link href="/create" className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all border-b-4 border-blue-600 group">
          <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🚗</div>
          <h2 className="text-2xl font-bold text-gray-900">Car Owner</h2>
          <p className="text-gray-500 mt-2">I want to renew papers, apply for a license, or book an inspection.</p>
          <div className="mt-6 text-blue-600 font-bold flex items-center">
            Start Request <span className="ml-2">→</span>
          </div>
        </Link>

        {/* AGENT CARD */}
        <Link href="/agent" className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all border-b-4 border-green-600 group">
          <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🤝</div>
          <h2 className="text-2xl font-bold text-gray-900">Agent Partner</h2>
          <p className="text-gray-500 mt-2">I am a licensed agent and I want to offer my services on the platform.</p>
          <div className="mt-6 text-green-600 font-bold flex items-center">
            Join Network <span className="ml-2">→</span>
          </div>
        </Link>
      </div>

      {/* 3. TRACKER SECTION */}
      <div className="max-w-md mx-auto w-full px-6 pb-20">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Track Application
          </label>
          <div className="flex gap-2 mb-4">
            <input 
              className="flex-1 bg-gray-50 border border-gray-200 text-lg p-3 rounded-xl outline-none focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
              placeholder="Enter Ticket ID (PADI-...)"
              value={ticketId}
              onChange={handleInputChange}
            />
            <button onClick={checkStatus} disabled={loading} className="bg-gray-900 text-white px-6 rounded-xl font-bold">
              {loading ? '...' : 'Check'}
            </button>
          </div>

          {/* STATUS DISPLAY (Timeline) */}
          {statusResult && (
            <div className={`rounded-xl p-5 ${statusResult.success ? 'bg-green-50 border border-green-100' : 'bg-red-50 text-red-600'}`}>
              {!statusResult.success ? (
                <p className="font-bold">{statusResult.message}</p>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-4 border-b border-green-200 pb-2">
                    <span className="font-bold text-green-800 text-lg">
                      {statusResult.data.status_display || statusResult.data.status}
                    </span>
                    <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                      {statusResult.data.service_type}
                    </span>
                  </div>
                  
                  {/* Timeline Loop */}
                  <div className="space-y-3">
                     {statusResult.data.history.map((log: any, index: number) => (
                       <div key={index} className="flex gap-3 text-sm">
                         <div className="flex flex-col items-center">
                           <div className="w-2 h-2 rounded-full bg-green-600 mt-1.5"></div>
                           {index < statusResult.data.history.length - 1 && (
                             <div className="w-px h-full bg-green-200 my-1"></div>
                           )}
                         </div>
                         <div>
                           <p className="font-medium text-green-900">{log.status}</p>
                           <p className="text-xs text-green-600">{log.timestamp}</p>
                         </div>
                       </div>
                     ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

    </main>
  );
}