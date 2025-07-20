import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface KYCModalProps {
  onClose: () => void;
}

export default function KYCModal({ onClose }: KYCModalProps) {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [country, setCountry] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  const countries = [
    { code: 'US', label: 'United States (SSN)' },
    { code: 'IN', label: 'India (Aadhaar)' },
    { code: 'DE', label: 'Germany (Personalausweis)' },
    { code: 'FR', label: 'France (Carte Nationale d\'Identité)' },
    { code: 'UK', label: 'United Kingdom (NIN)' },
    { code: 'CA', label: 'Canada (SIN)' },
    { code: 'AU', label: 'Australia (Medicare/TFN)' },
    { code: 'SG', label: 'Singapore (NRIC)' },
    { code: 'BR', label: 'Brazil (CPF)' },
    { code: 'ZA', label: 'South Africa (ID)' },
    { code: 'JP', label: 'Japan (My Number)' },
    // Add more as needed
  ];

  const handleNext = () => {
    if (step === 3) return handleSubmit();
    setStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep((prev) => prev - 1);
  };

  const handleSubmit = () => {
    if (!fullName || !country || !nationalId || !documentFile) {
      alert('Please complete all fields.');
      return;
    }

    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('country', country);
    formData.append('nationalId', nationalId);
    formData.append('document', documentFile);

    // TODO: replace with actual API call
    console.log('Submitting KYC:', { fullName, country, nationalId, documentFile });
    alert('KYC submitted successfully!');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
          onClick={onClose}
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <h2 className="text-xl font-bold mb-4 text-gray-900">KYC Verification</h2>

        <div className="space-y-4">
          {step === 1 && (
            <>
              <label className="block text-sm text-gray-700">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-gray-900"
                placeholder="Your full legal name"
              />
            </>
          )}

          {step === 2 && (
            <>
              <label className="block text-sm text-gray-700">Select Country</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-gray-900"
              >
                <option value="">-- Choose your country --</option>
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>

              <label className="block text-sm text-gray-700 mt-4">National ID Number</label>
              <input
                type="text"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-gray-900"
                placeholder="e.g., 1234-5678-9012"
              />
            </>
          )}

          {step === 3 && (
            <>
              <label className="block text-sm text-gray-700">Upload ID Document</label>
              <input
                type="file"
                onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                className="w-full border border-gray-300 p-2 rounded text-gray-900 bg-white"
              />
              <p className="text-xs text-gray-500 mt-1">
                Accepted formats: JPG, PNG, PDF.
              </p>
            </>
          )}
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={handlePrev}
            disabled={step === 1}
            className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            className="px-6 py-2 rounded bg-yellow-400 text-black font-semibold hover:bg-yellow-500"
          >
            {step === 3 ? 'Submit' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
