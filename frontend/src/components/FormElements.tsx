import React from 'react';

// 1. Standard Text Input
export const Input = ({ label, ...props }: any) => (
  <div className="mb-4">
    <label className="block text-xs font-bold text-gray-700 uppercase mb-1 tracking-wider">
      {label}
    </label>
    <input
      {...props}
      className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none transition-all"
    />
  </div>
);

// 2. Standard Dropdown (Select)
export const Select = ({ label, options, ...props }: any) => (
  <div className="mb-4">
    <label className="block text-xs font-bold text-gray-700 uppercase mb-1 tracking-wider">
      {label}
    </label>
    <select
      {...props}
      className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none transition-all appearance-none"
    >
      <option value="">-- Select --</option>
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

// 3. File Upload Field (Updated for Multiple Files)
export const FileUpload = ({ label, multiple = false, onChange, ...props }: any) => {
  // We need local state to show the selected file names
  const [fileNames, setFileNames] = React.useState<string[]>([]);

  const handleFileChange = (e: any) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Create an array of file names to display
      const names = Array.from(files).map((f: any) => f.name);
      setFileNames(names);
      
      // Pass the actual FileList back to the parent
      if (onChange) onChange(files);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-xs font-bold text-gray-700 uppercase mb-1 tracking-wider">
        {label}
      </label>
      <div className="relative border-dashed border-2 border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition-colors text-center cursor-pointer">
        <input
          type="file"
          multiple={multiple}
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          {...props}
        />
        <div className="text-gray-500">
          <span className="text-2xl block mb-1">📂</span>
          <span className="text-sm font-medium">Click to upload documents</span>
          <p className="text-xs opacity-70 mt-1">
            {multiple ? 'You can select up to 5 files' : 'Select a single file'}
          </p>
        </div>
      </div>
      
      {/* Show Selected Files */}
      {fileNames.length > 0 && (
        <div className="mt-2 space-y-1">
          {fileNames.map((name, idx) => (
            <p key={idx} className="text-xs text-blue-600 flex items-center">
              ✅ {name}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

// 4. Section Header
export const SectionTitle = ({ title, subtitle }: any) => (
  <div className="mb-6 border-b border-gray-100 pb-2">
    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
    {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
  </div>
);

// 5. Radio Button Group (For Delivery Method, Gender, etc.)
export const RadioGroup = ({ label, options, name, value, onChange }: any) => (
  <div className="mb-4">
    <label className="block text-xs font-bold text-gray-700 uppercase mb-2 tracking-wider">
      {label}
    </label>
    <div className="grid grid-cols-2 gap-3">
      {options.map((opt: any) => (
        <label 
          key={opt.value} 
          className={`cursor-pointer border rounded-lg p-3 text-sm flex items-center justify-center transition-all ${value === opt.value ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={onChange}
            className="hidden" 
          />
          {opt.label}
        </label>
      ))}
    </div>
  </div>
);

// 6. Checkbox Group (For Vehicle Papers Multi-select)
export const CheckboxGroup = ({ label, options, selectedValues, onChange }: any) => (
  <div className="mb-6">
    <label className="block text-xs font-bold text-gray-700 uppercase mb-2 tracking-wider">
      {label}
    </label>
    <div className="space-y-2">
      {options.map((opt: any) => (
        <label 
          key={opt.value} 
          className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${selectedValues.includes(opt.value) ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-200'}`}
        >
          <input
            type="checkbox"
            value={opt.value}
            checked={selectedValues.includes(opt.value)}
            onChange={(e) => {
              const val = e.target.value;
              // If it's checked, add it. If unchecked, remove it.
              const newArr = e.target.checked 
                ? [...selectedValues, val] 
                : selectedValues.filter((v: any) => v !== val);
              onChange(newArr);
            }}
            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
          />
          <span className="ml-3 text-sm text-gray-700 font-medium">{opt.label}</span>
        </label>
      ))}
    </div>
  </div>
);