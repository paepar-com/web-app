'use client';
import { useState } from 'react';
import { Input, Select, CheckboxGroup, SectionTitle } from '@/components/FormElements';
import Link from 'next/link';

export default function AgentForm() {
  const [formData, setFormData] = useState<any>({
    full_name: '', phone: '', email: '',
    state_of_practice: '', is_licensed: 'NO', services_offered: []
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Convert 'Yes/No' string to Boolean for backend
    const payload = {
      ...formData,
      is_licensed: formData.is_licensed === 'YES'
    };

    try {
      const res = await fetch('http://127.0.0.1:8000/api/orders/agent/create/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) setSubmitted(true);
      else alert("Error submitting form.");
    } catch { alert("Connection Error"); } finally { setLoading(false); }
  };

  if (submitted) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-2">Application Received</h2>
          <p className="text-gray-500 mb-6">Thank you for joining Paepar. Our admin team will review your license and contact you shortly.</p>
          <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">Back to Home</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 py-10 px-4 flex justify-center">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-green-700 p-6 text-white">
          <Link href="/" className="text-green-200 text-sm">← Back</Link>
          <h1 className="text-2xl font-bold mt-2">Agent Registration</h1>
          <p className="opacity-80 text-sm">Join our network of verified processing agents.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          <Input label="Full Name" value={formData.full_name} onChange={(e:any) => setFormData({...formData, full_name: e.target.value})} required />
          <Input label="Phone Number" type="tel" value={formData.phone} onChange={(e:any) => setFormData({...formData, phone: e.target.value})} required />
          <Input label="Email Address" type="email" value={formData.email} onChange={(e:any) => setFormData({...formData, email: e.target.value})} required />
          
          <CheckboxGroup label="Services you offer" 
             options={[
               {label: 'Car Inspection', value: 'INSPECTION'},
               {label: "Driver's License", value: 'DL'},
               {label: 'Car Papers', value: 'VEHICLE'}
             ]}
             selectedValues={formData.services_offered}
             onChange={(v: any) => setFormData({...formData, services_offered: v})}
          />

          <Select label="Are you licensed?" 
             options={[{label: 'Yes ✅', value: 'YES'}, {label: 'No ❌', value: 'NO'}]}
             value={formData.is_licensed} onChange={(e:any) => setFormData({...formData, is_licensed: e.target.value})}
          />

          <Input label="State of Practice" placeholder="e.g. Lagos State" value={formData.state_of_practice} onChange={(e:any) => setFormData({...formData, state_of_practice: e.target.value})} required />

          <button type="submit" disabled={loading} className="w-full bg-green-600 text-white font-bold py-4 rounded-xl mt-4 hover:bg-green-700">
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </main>
  );
}