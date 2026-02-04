'use client';

import { useState } from 'react';
import { Input, Select, FileUpload, RadioGroup, CheckboxGroup } from '@/components/FormElements';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CreateWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [successId, setSuccessId] = useState('');
  const [errors, setErrors] = useState<any>({}); // For in-app validation
  
  // --- STATE: Client Data ---
  const [client, setClient] = useState({
    phone: '', full_name: '', email: '', residential_address: '',
    dob: '', state_of_origin: '', lga_of_origin: '', nationality: 'Nigerian',
  });

  // --- STATE: Service Data ---
  const [serviceType, setServiceType] = useState(''); // DL, VEHICLE, or INSPECTION
  const [formData, setFormData] = useState<any>({
    // DL Fields
    dl_application_type: '', blood_group: '', genotype: '',
    // Vehicle Fields
    vehicle_paper_types: [], vehicle_transaction_type: '', existing_documents_desc: '', 
    vehicle_details: '', chassis_number: '',
    // Inspection Fields
    inspection_type: '', preferred_inspection_date: '',
    // Common
    delivery_method: 'PICKUP', fee_acknowledged: false, signature_authorized: false,
    // FILES
    files: [] 
  });

  // --- VALIDATION LOGIC ---
  const validateStep1 = () => {
    const newErrors: any = {};
    
    // Nigerian Phone Validation
    const phoneRegex = /^0\d{10}$/;
    if (!phoneRegex.test(client.phone)) {
      newErrors.phone = "Enter a valid 11-digit Nigerian number (e.g. 08012345678).";
    }

    // Email Validation
    if (!client.email.includes("@") || !client.email.includes(".")) {
      newErrors.email = "Please enter a valid email address.";
    }

    // Full Name Validation
    if (!client.full_name.trim().includes(" ")) {
      newErrors.full_name = "Please enter both Surname and First Name.";
    }

    // Age Validation (18+)
    const birthYear = new Date(client.dob).getFullYear();
    const currentYear = new Date().getFullYear();
    if (!client.dob || currentYear - birthYear < 18) {
      newErrors.dob = "You must be at least 18 years old to apply.";
    }

    // Required Field Checks
    if (!client.state_of_origin) newErrors.state_of_origin = "State is required.";
    if (!client.lga_of_origin) newErrors.lga_of_origin = "LGA is required.";
    if (!client.residential_address) newErrors.residential_address = "Address is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- HANDLER: Step 1 (Client) ---
  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1()) return; // Stop if validation fails

    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/orders/client/save/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(client),
      });
      if (res.ok) {
        const data = await res.json();
        setClient(data);
        setStep(2);
      } else {
        setErrors({ general: "Please check your details or connection." });
      }
    } catch (err) { setErrors({ general: "Connection Error. Is the backend running?" }); } finally { setLoading(false); }
  };

  // --- HANDLER: Step 3 (Final Order) ---
  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fee_acknowledged) return alert("Please acknowledge the service fee.");
    if (!formData.signature_authorized) return alert("Please sign to authorize processing.");
    
    setLoading(true);

    const payload = new FormData();
    payload.append('client_phone', client.phone);
    payload.append('service_type', serviceType);
    
    Object.keys(formData).forEach(key => {
      if (key === 'files') return; 
      if (Array.isArray(formData[key])) {
         payload.append(key, JSON.stringify(formData[key])); 
      } else {
        payload.append(key, formData[key]);
      }
    });

    if (formData.files && formData.files.length > 0) {
      for (let i = 0; i < Math.min(formData.files.length, 5); i++) {
        payload.append('supporting_docs', formData.files[i]);
      }
    }

    try {
      const res = await fetch('http://127.0.0.1:8000/api/orders/create/', {
        method: 'POST',
        body: payload, 
      });
      if (res.ok) {
        const data = await res.json();
        setSuccessId(data.ticket_id);
      } else {
        alert("Error creating order.");
      }
    } catch (err) { alert("Connection Error"); } finally { setLoading(false); }
  };

  // --- Auto-fetch Client ---
  const checkPhone = async (phoneValue: string) => {
    setClient({ ...client, phone: phoneValue });
    // Clear phone error as user types
    if (errors.phone) setErrors({...errors, phone: null});
    
    if (phoneValue.length === 11) {
      setLoading(true);
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/orders/client/get/${phoneValue}/`);
        if (res.ok) setClient(await res.json());
      } catch (err) {} finally { setLoading(false); }
    }
  };

  // --- SUCCESS SCREEN ---
  if (successId) {
    return (
      <main className="min-h-screen bg-green-50 p-6 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mb-6">🎉</div>
        <h2 className="text-3xl font-bold text-gray-900">Request Received!</h2>
        <p className="text-gray-600 mt-2 mb-6">Your tracking ID is:</p>
        <div className="bg-white p-4 rounded-xl font-mono text-2xl font-bold tracking-widest border-2 border-green-200 select-all shadow-sm">
          {successId}
        </div>
        <p className="text-sm text-gray-500 mt-6 max-w-sm">
          We have sent a confirmation to your WhatsApp and Email.
        </p>
        <Link href="/" className="mt-8 bg-green-600 text-white py-3 px-8 rounded-xl font-bold">Back to Home</Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 flex justify-center">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-blue-900 p-6 text-white sticky top-0 z-10">
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => step > 1 && setStep(step - 1)} className="text-blue-200 text-sm hover:text-white">
              {step > 1 ? '← Back' : <Link href="/">Cancel</Link>}
            </button>
            <span className="text-xs font-mono opacity-50">STEP {step} OF 3</span>
          </div>
          <h1 className="text-xl font-bold">
            {step === 1 ? 'Primary Info' : step === 2 ? 'Select Service' : 
             serviceType === 'DL' ? "Driver's License" : 
             serviceType === 'VEHICLE' ? "Vehicle Papers" : "Car Inspection"}
          </h1>
        </div>

        {/* STEP 1: PRIMARY INFO */}
        {step === 1 && (
          <form onSubmit={handleClientSubmit} className="p-6 space-y-4" noValidate>
             <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4">
              <Input label="WhatsApp Number" type="tel" value={client.phone} onChange={(e:any) => checkPhone(e.target.value)} />
              {errors.phone && <p className="text-red-500 text-xs font-bold mt-1">{errors.phone}</p>}
              <p className="text-xs text-blue-600 mt-1">We use this to track your history.</p>
            </div>

            <div>
              <Input label="Full Name (Surname First)" value={client.full_name} onChange={(e:any) => setClient({...client, full_name: e.target.value})} />
              {errors.full_name && <p className="text-red-500 text-xs font-bold mt-1">{errors.full_name}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input label="Date of Birth" type="date" value={client.dob} onChange={(e:any) => setClient({...client, dob: e.target.value})} />
                {errors.dob && <p className="text-red-500 text-xs font-bold mt-1">{errors.dob}</p>}
              </div>
              <Input label="Nationality" value={client.nationality} onChange={(e:any) => setClient({...client, nationality: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input label="State of Origin" value={client.state_of_origin} onChange={(e:any) => setClient({...client, state_of_origin: e.target.value})} />
                {errors.state_of_origin && <p className="text-red-500 text-xs font-bold mt-1">{errors.state_of_origin}</p>}
              </div>
              <div>
                <Input label="LGA of Origin" value={client.lga_of_origin} onChange={(e:any) => setClient({...client, lga_of_origin: e.target.value})} />
                {errors.lga_of_origin && <p className="text-red-500 text-xs font-bold mt-1">{errors.lga_of_origin}</p>}
              </div>
            </div>

            <div>
              <Input label="Residential Address (Include LGA)" value={client.residential_address} onChange={(e:any) => setClient({...client, residential_address: e.target.value})} />
              {errors.residential_address && <p className="text-red-500 text-xs font-bold mt-1">{errors.residential_address}</p>}
            </div>
            
            <div>
              <Input label="Email Address" type="email" value={client.email} onChange={(e:any) => setClient({...client, email: e.target.value})} />
              {errors.email && <p className="text-red-500 text-xs font-bold mt-1">{errors.email}</p>}
            </div>
            
            {errors.general && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-bold">{errors.general}</div>}

            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl mt-4">
              {loading ? 'Checking...' : 'Next Step →'}
            </button>
          </form>
        )}

        {/* STEP 2: SERVICE SELECTION */}
        {step === 2 && (
          <div className="p-6 grid gap-4">
            {[
              { id: 'DL', title: "Driver's License", icon: '🪪' },
              { id: 'VEHICLE', title: "Vehicle Papers", icon: '🚗' },
              { id: 'INSPECTION', title: "Car Inspection", icon: '🔍' },
            ].map((s) => (
              <button key={s.id} onClick={() => { setServiceType(s.id); setStep(3); }}
                className="p-6 text-left border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 rounded-2xl transition-all flex items-center gap-4 group"
              >
                <span className="text-3xl bg-white w-14 h-14 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">{s.icon}</span>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{s.title}</h3>
                  <p className="text-sm text-gray-500">Click to start application</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* STEP 3: SPECIFIC FORMS (Original Logic Restored) */}
        {step === 3 && (
          <form onSubmit={handleOrderSubmit} className="p-6 space-y-6 pb-20">
            
            {/* --- A. DRIVER LICENSE FORM --- */}
            {serviceType === 'DL' && (
              <>
                <Select label="Application Type" 
                  options={[
                    {label: 'Fresh/First-Time', value: 'FRESH'}, {label: 'Renewal', value: 'RENEWAL'},
                    {label: 'Re-issue (Lost)', value: 'REISSUE'}, {label: 'N/A', value: 'NA'}
                  ]}
                  value={formData.dl_application_type} onChange={(e:any) => setFormData({...formData, dl_application_type: e.target.value})} 
                />
                <div className="grid grid-cols-2 gap-4">
                  <Select label="Blood Group" 
                    options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(v => ({label: v, value: v}))}
                    value={formData.blood_group} onChange={(e:any) => setFormData({...formData, blood_group: e.target.value})} 
                  />
                  <Select label="Genotype" 
                    options={['AA', 'AS', 'AC', 'SS', 'SC'].map(v => ({label: v, value: v}))}
                    value={formData.genotype} onChange={(e:any) => setFormData({...formData, genotype: e.target.value})} 
                  />
                </div>
                <FileUpload label="Upload Passport Photo" 
                  onChange={(files: FileList) => setFormData({...formData, files: files})}
                />
                <FileUpload label="Upload NIN Slip / Valid ID" 
                  onChange={(files: FileList) => setFormData({...formData, files: files})}
                />
              </>
            )}

            {/* --- B. VEHICLE PAPERS FORM --- */}
            {serviceType === 'VEHICLE' && (
              <>
                 <CheckboxGroup label="Which papers do you need?"
                  options={[
                    {label: 'New Registration (Full)', value: 'New Registration'},
                    {label: 'Vehicle License', value: 'Vehicle License'},
                    {label: 'Roadworthiness', value: 'Roadworthiness'},
                    {label: 'Proof of Ownership', value: 'Proof of Ownership'},
                    {label: 'Plate Number Replacement', value: 'Plate Number Replacement'},
                    {label: 'Third-Party Insurance', value: 'Third-Party Insurance'},
                  ]}
                  selectedValues={formData.vehicle_paper_types}
                  onChange={(newVal: any) => setFormData({...formData, vehicle_paper_types: newVal})}
                />
                <Select label="Transaction Type" 
                  options={[
                    {label: 'New Registration', value: 'NEW_REG'}, {label: 'Renewal', value: 'RENEWAL'},
                    {label: 'Change of Ownership', value: 'CHANGE_OWNER'}, {label: 'Lost Replacement', value: 'LOST_REPLACEMENT'}
                  ]}
                  value={formData.vehicle_transaction_type} onChange={(e:any) => setFormData({...formData, vehicle_transaction_type: e.target.value})} 
                />
                <Input label="Vehicle Details (Model, Year, Color)" placeholder="e.g. Toyota Camry 2014 Silver"
                  value={formData.vehicle_details} onChange={(e:any) => setFormData({...formData, vehicle_details: e.target.value})} 
                />
                <Input label="Chassis Number (VIN)" 
                  value={formData.chassis_number} onChange={(e:any) => setFormData({...formData, chassis_number: e.target.value})} 
                />
                <Input label="Details of Existing Docs" placeholder="I already have..."
                  value={formData.existing_documents_desc} onChange={(e:any) => setFormData({...formData, existing_documents_desc: e.target.value})} 
                />
                <FileUpload label="Upload Supporting Documents (Max 5)" 
                  multiple={true}
                  onChange={(files: FileList) => setFormData({...formData, files: files})}
                />
              </>
            )}

            {/* --- C. INSPECTION FORM --- */}
            {serviceType === 'INSPECTION' && (
              <>
                <RadioGroup label="Inspection Type" name="ins_type"
                  options={[{label: 'Commercial', value: 'COMMERCIAL'}, {label: 'Personal', value: 'PERSONAL'}]}
                  value={formData.inspection_type} onChange={(e:any) => setFormData({...formData, inspection_type: e.target.value})} 
                />
                <Input label="Vehicle Details" placeholder="e.g. Toyota Camry 2014 Silver"
                  value={formData.vehicle_details} onChange={(e:any) => setFormData({...formData, vehicle_details: e.target.value})} 
                />
                <Input label="Preferred Date/Time" type="datetime-local"
                  value={formData.preferred_inspection_date} onChange={(e:any) => setFormData({...formData, preferred_inspection_date: e.target.value})} 
                />
              </>
            )}

            {/* --- COMMON FOOTER --- */}
            <div className="pt-6 border-t border-gray-100">
               {serviceType !== 'INSPECTION' && (
                 <RadioGroup label="Delivery Method" name="delivery"
                    options={[{label: 'Pickup', value: 'PICKUP'}, {label: 'Delivery', value: 'DELIVERY'}]}
                    value={formData.delivery_method} onChange={(e:any) => setFormData({...formData, delivery_method: e.target.value})} 
                  />
               )}

               <label className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200 cursor-pointer">
                  <input type="checkbox" className="mt-1 w-5 h-5" 
                    checked={formData.fee_acknowledged} onChange={(e) => setFormData({...formData, fee_acknowledged: e.target.checked})}
                  />
                  <span className="text-xs text-yellow-800 font-medium">
                    I understand that there are service fees associated with this request.
                  </span>
               </label>

               <label className="flex items-start gap-3 mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer">
                  <input type="checkbox" className="mt-1 w-5 h-5" 
                    checked={formData.signature_authorized} onChange={(e) => setFormData({...formData, signature_authorized: e.target.checked})}
                  />
                  <span className="text-xs text-gray-600">
                    I, <span className="font-bold">{client.full_name}</span>, authorize Paepar to process these documents.
                  </span>
               </label>

               <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl mt-6 shadow-xl transition-all">
                  {loading ? 'Submitting...' : 'Submit Request'}
               </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}