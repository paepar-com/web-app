'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CreateOrder() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    service_type: 'DL', // Default to Driver's License
    vehicle_details: ''
  });
  const [loading, setLoading] = useState(false);
  const [successId, setSuccessId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/orders/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessId(data.ticket_id); // Save the new ID to show the user
      } else {
        alert('Something went wrong. Please check your inputs.');
      }
    } catch (error) {
      alert('Connection error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  if (successId) {
    return (
      <main className="min-h-screen bg-white p-6 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mb-4">
          ✅
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Application Received!</h2>
        <p className="text-gray-500 mt-2">Your tracking ID is:</p>
        <div className="bg-gray-100 p-4 rounded-xl font-mono text-xl font-bold tracking-widest mt-4 border border-gray-200 select-all">
          {successId}
        </div>
        <p className="text-xs text-gray-400 mt-4 max-w-xs">
          Please screenshot or copy this ID. You will need it to track your status.
        </p>
        <Link href="/" className="mt-8 bg-blue-600 text-white py-3 px-8 rounded-xl font-medium">
          Back to Home
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <Link href="/" className="text-sm text-gray-500 mb-6 inline-block">
        ← Back to Home
      </Link>
      
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-1">New Application</h1>
        <p className="text-sm text-gray-500 mb-6">Fill in your details to start processing.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Full Name</label>
            <input 
              required
              type="text" 
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 outline-none focus:border-blue-500"
              placeholder="e.g. Praise Cookie"
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Phone Number</label>
            <input 
              required
              type="tel" 
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 outline-none focus:border-blue-500"
              placeholder="e.g. 08012345678"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Service Type</label>
            <select 
              className="w-full bg-white border border-gray-200 rounded-lg p-3 outline-none focus:border-blue-500"
              value={formData.service_type}
              onChange={(e) => setFormData({...formData, service_type: e.target.value})}
            >
              <option value="DL">Driver's License</option>
              <option value="VEHICLE">Vehicle Renewal</option>
              <option value="NEW_PLATE">New Number Plate</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Vehicle Details (Optional)</label>
            <textarea 
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 outline-none focus:border-blue-500 h-24 resize-none"
              placeholder="Car Model, Year, Plate Number..."
              value={formData.vehicle_details}
              onChange={(e) => setFormData({...formData, vehicle_details: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl mt-4 hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Submit Application'}
          </button>

        </form>
      </div>
    </main>
  );
}