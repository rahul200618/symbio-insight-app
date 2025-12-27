import React, { useState, useEffect } from 'react';

const PARSER_KEY = 'fasta_parser_preference';

export default function SettingsPage() {
  const [parser, setParser] = useState('js');

  useEffect(() => {
    const saved = localStorage.getItem(PARSER_KEY);
    if (saved) setParser(saved);
  }, []);

  const handleChange = (e) => {
    setParser(e.target.value);
    localStorage.setItem(PARSER_KEY, e.target.value);
  };

  // Advanced features state (could be persisted to localStorage or backend)
  const [advancedEnabled, setAdvancedEnabled] = useState(true);
  const [features, setFeatures] = useState({
    codonUsage: true,
    orfPrediction: true,
    sequenceAlignment: false,
    blast: false,
    proteinTranslation: true,
    gcSkew: true,
  });

  const handleFeatureToggle = (key) => {
    setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4">Settings</h2>
      <div className="mb-6">
        <label className="block font-medium mb-2">FASTA Parser</label>
        <select value={parser} onChange={handleChange} className="border rounded px-3 py-2">
          <option value="js">JavaScript (default, in-browser)</option>
          <option value="biopython">Biopython (backend, more robust)</option>
        </select>
        <p className="text-sm text-gray-500 mt-2">
          Choose which parser to use for FASTA files. JavaScript is faster and works offline. Biopython is more robust for complex files.
        </p>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Advanced Features</h3>
        <label className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            checked={advancedEnabled}
            onChange={() => setAdvancedEnabled((v) => !v)}
            className="accent-indigo-600 w-4 h-4"
          />
          <span className="font-medium">Enable experimental tools</span>
        </label>
        <hr className="my-4" />
        <div className="space-y-4">
          <FeatureCard
            enabled={features.codonUsage && advancedEnabled}
            onClick={() => handleFeatureToggle('codonUsage')}
            title="Codon Usage Analysis"
            description="Analyze codon frequency and bias"
          />
          <FeatureCard
            enabled={features.orfPrediction && advancedEnabled}
            onClick={() => handleFeatureToggle('orfPrediction')}
            title="ORF Prediction"
            description="Find open reading frames in sequences"
          />
          <FeatureCard
            enabled={features.sequenceAlignment && advancedEnabled}
            onClick={() => handleFeatureToggle('sequenceAlignment')}
            title="Sequence Alignment"
            description="Align multiple sequences (coming soon)"
            comingSoon
          />
          <FeatureCard
            enabled={features.blast && advancedEnabled}
            onClick={() => handleFeatureToggle('blast')}
            title="BLAST Integration"
            description="Search NCBI databases (coming soon)"
            comingSoon
          />
          <FeatureCard
            enabled={features.proteinTranslation && advancedEnabled}
            onClick={() => handleFeatureToggle('proteinTranslation')}
            title="Protein Translation"
            description="Translate DNA to amino acids"
          />
          <FeatureCard
            enabled={features.gcSkew && advancedEnabled}
            onClick={() => handleFeatureToggle('gcSkew')}
            title="GC Skew Analysis"
            description="Analyze GC distribution patterns"
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ enabled, onClick, title, description, comingSoon }) {
  return (
    <div
      className={`flex items-center justify-between p-4 rounded-xl border ${enabled ? 'bg-white shadow border-indigo-200' : 'bg-gray-50 border-gray-200'} ${comingSoon ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={!comingSoon ? onClick : undefined}
      style={{ pointerEvents: comingSoon ? 'none' : undefined }}
    >
      <div>
        <div className="flex items-center gap-2 mb-1">
          {enabled ? (
            <span className="text-indigo-600 text-xl">&#10003;</span>
          ) : (
            <span className="text-gray-400 text-xl">&#9432;</span>
          )}
          <span className={`font-semibold ${enabled ? 'text-indigo-700' : 'text-gray-500'}`}>{title}</span>
        </div>
        <div className="text-sm text-gray-500">{description}</div>
      </div>
    </div>
  );
}
