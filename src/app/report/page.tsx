'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateReport, type ReportRequest } from '@/lib/reportApi';

export default function ReportCalculator() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<ReportRequest>({
    height: undefined,
    weight: undefined,
    forty: undefined,
    vertical: undefined,
    shuttle: undefined,
    powerball: undefined,
    sport: 'All Sports',
    position: '',
    name: '',
    grad_year: undefined,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Convert numeric fields
    if (['height', 'weight', 'forty', 'vertical', 'shuttle', 'powerball', 'grad_year'].includes(name)) {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? undefined : parseFloat(value),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const reportData = await generateReport(formData);
      
      // Store the report data in sessionStorage to pass to results page
      sessionStorage.setItem('sparq-report', JSON.stringify(reportData));
      
      // Navigate to results
      router.push('/report/results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gmtm-bg via-gmtm-bg-secondary to-gmtm-purple-light">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-block mb-4">
            <div className="text-6xl md:text-7xl font-black text-gmtm-sidebar tracking-tight">
              SPARQ<sup className="text-3xl">®</sup>
            </div>
            <div className="h-1.5 bg-gradient-to-r from-gmtm-lime via-gmtm-purple to-gmtm-lime rounded-full mt-2"></div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gmtm-text mb-2">
            Calculate Your SPARQ Rating
          </h1>
          <p className="text-gmtm-text-secondary text-sm md:text-base">
            Discover how you compare to 26,000+ athletes across 65+ sports
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-card-hover p-6 md:p-8 mb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Performance Metrics */}
            <div>
              <h2 className="text-lg font-bold text-gmtm-text mb-4 flex items-center">
                <span className="w-8 h-8 bg-gmtm-purple text-white rounded-full flex items-center justify-center text-sm mr-3">1</span>
                Performance Metrics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gmtm-text mb-1.5">
                    Height (inches) *
                  </label>
                  <input
                    type="number"
                    name="height"
                    min="20"
                    max="96"
                    step="0.1"
                    required
                    value={formData.height || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gmtm-border rounded-lg focus:ring-2 focus:ring-gmtm-purple focus:border-transparent outline-none transition"
                    placeholder="72"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gmtm-text mb-1.5">
                    Body Weight (lbs) *
                  </label>
                  <input
                    type="number"
                    name="weight"
                    min="70"
                    max="450"
                    step="0.1"
                    required
                    value={formData.weight || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gmtm-border rounded-lg focus:ring-2 focus:ring-gmtm-purple focus:border-transparent outline-none transition"
                    placeholder="180"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gmtm-text mb-1.5">
                    40-Yard Dash (seconds) *
                  </label>
                  <input
                    type="number"
                    name="forty"
                    min="3.00"
                    max="8.00"
                    step="0.01"
                    required
                    value={formData.forty || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gmtm-border rounded-lg focus:ring-2 focus:ring-gmtm-purple focus:border-transparent outline-none transition"
                    placeholder="4.50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gmtm-text mb-1.5">
                    Vertical Jump (inches) *
                  </label>
                  <input
                    type="number"
                    name="vertical"
                    min="0"
                    max="96"
                    step="0.1"
                    required
                    value={formData.vertical || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gmtm-border rounded-lg focus:ring-2 focus:ring-gmtm-purple focus:border-transparent outline-none transition"
                    placeholder="32"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gmtm-text mb-1.5">
                    5-10-5 Shuttle (seconds) *
                  </label>
                  <input
                    type="number"
                    name="shuttle"
                    min="3.00"
                    max="8.00"
                    step="0.01"
                    required
                    value={formData.shuttle || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gmtm-border rounded-lg focus:ring-2 focus:ring-gmtm-purple focus:border-transparent outline-none transition"
                    placeholder="4.20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gmtm-text mb-1.5">
                    Powerball Toss (feet) *
                  </label>
                  <input
                    type="number"
                    name="powerball"
                    min="0"
                    max="60"
                    step="0.1"
                    required
                    value={formData.powerball || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gmtm-border rounded-lg focus:ring-2 focus:ring-gmtm-purple focus:border-transparent outline-none transition"
                    placeholder="35"
                  />
                </div>
              </div>
            </div>

            {/* Athlete Info */}
            <div>
              <h2 className="text-lg font-bold text-gmtm-text mb-4 flex items-center">
                <span className="w-8 h-8 bg-gmtm-lime text-gmtm-sidebar rounded-full flex items-center justify-center text-sm mr-3 font-bold">2</span>
                Athlete Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gmtm-text mb-1.5">
                    Sport *
                  </label>
                  <select
                    name="sport"
                    required
                    value={formData.sport}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gmtm-border rounded-lg focus:ring-2 focus:ring-gmtm-purple focus:border-transparent outline-none transition bg-white"
                  >
                    <option value="All Sports">All Sports</option>
                    <option value="Football">Football</option>
                    <option value="Volleyball">Volleyball</option>
                    <option value="Basketball">Basketball</option>
                    <option value="Track & Field">Track & Field</option>
                    <option value="Flag Football">Flag Football</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gmtm-text-secondary mb-1.5">
                    Position (optional)
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gmtm-border rounded-lg focus:ring-2 focus:ring-gmtm-purple focus:border-transparent outline-none transition"
                    placeholder="Wide Receiver"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gmtm-text-secondary mb-1.5">
                    Graduation Year (optional)
                  </label>
                  <input
                    type="number"
                    name="grad_year"
                    min="2024"
                    max="2035"
                    value={formData.grad_year || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gmtm-border rounded-lg focus:ring-2 focus:ring-gmtm-purple focus:border-transparent outline-none transition"
                    placeholder="2026"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gmtm-text-secondary mb-1.5">
                    Name (optional)
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gmtm-border rounded-lg focus:ring-2 focus:ring-gmtm-purple focus:border-transparent outline-none transition"
                    placeholder="Your Name"
                  />
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-gmtm-error/10 border border-gmtm-error/20 rounded-lg text-gmtm-error text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gmtm-lime hover:bg-gmtm-lime-hover text-gmtm-sidebar font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing your metrics against 26,000+ athletes...
                </span>
              ) : (
                'Calculate My SPARQ® Rating'
              )}
            </button>
          </form>
        </div>

        {/* Info Footer */}
        <div className="text-center text-sm text-gmtm-text-secondary">
          <p>Your SPARQ rating measures Speed, Power, Agility, Reaction, and Quickness</p>
          <p className="mt-2">Powered by <span className="font-bold text-gmtm-text">GMTM</span></p>
        </div>
      </div>
    </div>
  );
}
