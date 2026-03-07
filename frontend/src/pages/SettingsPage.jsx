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
    <>
    <style>{`
      .settings-feature-card {
        position: relative;
        overflow: hidden;
        transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
      }

      .settings-feature-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 30px rgba(30, 58, 138, 0.18);
      }

      .settings-feature-card::after {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;
        opacity: 0;
        background: linear-gradient(115deg,
          rgba(59, 130, 246, 0) 15%,
          rgba(96, 165, 250, 0.2) 45%,
          rgba(59, 130, 246, 0) 75%);
        background-size: 220% 100%;
        transition: opacity 0.25s ease;
        animation: settingsSheen 2s linear infinite;
      }

      .settings-feature-card:hover::after {
        opacity: 1;
      }

      .settings-status-pulse {
        animation: settingsPulse 1.5s ease-in-out infinite;
      }

      @keyframes settingsSheen {
        0% {
          background-position: 200% 0;
        }

        100% {
          background-position: -20% 0;
        }
      }

      @keyframes settingsPulse {
        0%,
        100% {
          box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.6);
        }

        70% {
          box-shadow: 0 0 0 8px rgba(52, 211, 153, 0);
        }
      }
    `}</style>
    <div className="max-w-2xl mx-auto p-8 text-gray-900 dark:text-gray-100">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Settings</h2>
      <div className="mb-6">
        <label className="block font-medium mb-2 text-gray-800 dark:text-gray-100">FASTA Parser</label>
        <select
          value={parser}
          onChange={handleChange}
          className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="js">JavaScript (default, in-browser)</option>
          <option value="biopython">Biopython (backend, more robust)</option>
        </select>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Choose which parser to use for FASTA files. JavaScript is faster and works offline. Biopython is more robust for complex files.
        </p>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Advanced Features</h3>
        <label className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            checked={advancedEnabled}
            onChange={() => setAdvancedEnabled((v) => !v)}
            className="accent-[#D4AF37] w-4 h-4"
          />
          <span className="font-medium text-gray-800 dark:text-gray-100">Enable experimental tools</span>
        </label>
        <hr className="my-4 border-gray-200 dark:border-gray-700" />
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
    </>
  );
}

function FeatureCard({ enabled, onClick, title, description, comingSoon }) {
  const statusLabel = comingSoon ? 'Soon' : enabled ? 'On' : 'Off';

  return (
    <div
      className={`settings-feature-card flex items-center justify-between p-4 rounded-xl border transition-colors ${enabled
        ? 'bg-white dark:bg-gray-800 shadow border-[#BFDBFE] dark:border-[#1E3A8A]/50'
        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'} ${comingSoon ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={!comingSoon ? onClick : undefined}
      style={{ pointerEvents: comingSoon ? 'none' : undefined }}
    >
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-1">
          {enabled ? (
            <span className="text-[#1E3A8A] dark:text-[#60A5FA] text-xl">&#10003;</span>
          ) : (
            <span className="text-gray-400 dark:text-gray-500 text-xl">&#9432;</span>
          )}
          <span className={`font-semibold ${enabled ? 'text-[#1E3A8A] dark:text-[#93C5FD]' : 'text-gray-500 dark:text-gray-300'}`}>{title}</span>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-300">{description}</div>
      </div>

      <div
        className={`relative z-10 ml-4 px-2.5 py-1 rounded-full text-xs font-semibold border ${comingSoon
          ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600'
          : enabled
            ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/60'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600'
          }`}
      >
        <span className="inline-flex items-center gap-1.5">
          {statusLabel}
          {!comingSoon && enabled && <span className="w-2 h-2 rounded-full bg-emerald-400 settings-status-pulse" />}
        </span>
      </div>
    </div>
  );
}
