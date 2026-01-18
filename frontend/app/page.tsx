'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { startScan, ApiError } from '@/lib/api';
import { 
  Shield,
  Search,
  Settings,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [labMode, setLabMode] = useState(false);
  const [selectedAttacks, setSelectedAttacks] = useState<Record<string, boolean>>({
    sql_injection: true,
    csrf: true,
    least_privilege: true,
    credential_stuffing: true,
    dos: false,
    brute_force: false,
  });
  const [dosHttpRequests, setDosHttpRequests] = useState<number>(10);
  const [dosPingCount, setDosPingCount] = useState<number>(5);
  const [dosDuration, setDosDuration] = useState<number>(10);
  const [bruteForceDuration, setBruteForceDuration] = useState<number>(20);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const attackLabels: Record<string, string> = {
    sql_injection: 'SQL Injection',
    csrf: 'CSRF',
    least_privilege: 'Least Privilege',
    credential_stuffing: 'Credential Stuffing',
    dos: 'DoS Test',
    brute_force: 'Brute Force',
  };

  const handleAttackToggle = (attack: string) => {
    setSelectedAttacks(prev => ({
      ...prev,
      [attack]: !prev[attack]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const attacks: Record<string, any> = {};
      Object.entries(selectedAttacks).forEach(([k, v]) => {
        attacks[k] = { enabled: v };
      });
      if (selectedAttacks.dos) {
        attacks.dos.http_requests = dosHttpRequests;
        attacks.dos.ping_count = dosPingCount;
        attacks.dos.duration_sec = dosDuration;
      }
      if (selectedAttacks.brute_force) {
        attacks.brute_force.duration_sec = bruteForceDuration;
      }

      const response = await startScan({ target_url: url, lab_mode: labMode, attacks });
      router.push(`/runs/${response.run_id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Une erreur est survenue. Vérifiez que le backend est accessible.');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header avec inspiration ISEP */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#0066B3] rounded-lg flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-[#0066B3]">ISEP Security Scanner</h1>
              <p className="text-sm text-[#4FA3D1]">École d'ingénieurs du numérique</p>
            </div>
          </div>
          
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Analyse de Sécurité Web
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Scanner automatique de vulnérabilités pour applications web
          </p>
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Tests non-destructifs par défaut</span>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Search className="w-5 h-5 text-[#0066B3]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Configuration du scan</h2>
              <p className="text-sm text-gray-500">Définissez les paramètres de l'analyse</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* URL Input */}
            <div className="space-y-3">
              <label htmlFor="url" className="block text-sm font-medium text-gray-900">
                URL cible
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-[#0066B3] focus:border-[#0066B3]
                           text-base bg-white hover:bg-gray-50 transition-colors
                           placeholder-gray-400"
                  required
                  disabled={isLoading}
                />
              </div>
              <p className="text-sm text-gray-500">
                Saisissez l'URL complète de votre site web
              </p>
            </div>

            {/* Lab Mode Toggle */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                    <Settings className="w-4 h-4 text-gray-700" />
                  </div>
                  <div>
                    <label htmlFor="lab-mode" className="block text-sm font-medium text-gray-900">
                      Mode Laboratoire
                    </label>
                    <p className="text-sm text-gray-500">Activer les tests avancés</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setLabMode(!labMode)}
                  disabled={isLoading}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#0066B3] focus:ring-offset-2 ${
                    labMode ? 'bg-[#0066B3]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      labMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {labMode && (
                <div className="ml-4 p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 bg-[#F5B400] rounded flex items-center justify-center">
                      <AlertTriangle className="w-3 h-3 text-white" />
                    </div>
                    <h4 className="font-medium text-gray-900">Tests de laboratoire</h4>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm text-gray-700 mb-3">Sélection des tests :</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {Object.entries(attackLabels).map(([key, label]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => handleAttackToggle(key)}
                            disabled={isLoading}
                            className={`px-3 py-2 rounded-lg border transition-colors duration-200 text-sm ${
                              selectedAttacks[key]
                                ? 'border-[#0066B3] bg-[#0066B3] text-white'
                                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {selectedAttacks.dos && (
                      <div className="space-y-4 pt-4 border-t border-gray-200">
                        <h5 className="font-medium text-gray-900 text-sm">Paramètres DoS</h5>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs text-gray-700 mb-2">
                              Requêtes HTTP
                            </label>
                            <input
                              type="number"
                              value={dosHttpRequests}
                              min="1"
                              max="100"
                              onChange={(e) => setDosHttpRequests(Number(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0066B3] focus:border-[#0066B3] text-sm"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs text-gray-700 mb-2">
                              Ping Count
                            </label>
                            <input
                              type="number"
                              value={dosPingCount}
                              min="0"
                              max="20"
                              onChange={(e) => setDosPingCount(Number(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0066B3] focus:border-[#0066B3] text-sm"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs text-gray-700 mb-2">
                              Durée (secondes)
                            </label>
                            <input
                              type="number"
                              value={dosDuration}
                              min="1"
                              max="60"
                              onChange={(e) => setDosDuration(Number(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0066B3] focus:border-[#0066B3] text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedAttacks.brute_force && (
                      <div className="pt-4 border-t border-gray-200">
                        <label className="block text-sm text-gray-700 mb-2">
                          Durée brute-force (secondes)
                        </label>
                        <input
                          type="number"
                          value={bruteForceDuration}
                          min="5"
                          max="300"
                          onChange={(e) => setBruteForceDuration(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0066B3] focus:border-[#0066B3] text-sm"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-red-800 text-sm">Erreur</p>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="w-full py-3 px-6 bg-[#0066B3] hover:bg-[#005A9E] text-white font-medium rounded-lg 
                       transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0066B3]
                       flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Lancement du scan...</span>
                </>
              ) : (
                <>
                  <span>Lancer le scan</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-[#0066B3] transition-colors">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-5 h-5 text-[#0066B3]" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">TLS/SSL</h3>
            <p className="text-gray-600 text-sm">
              Analyse des certificats, expiration, configuration HSTS
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-[#0066B3] transition-colors">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <Settings className="w-5 h-5 text-[#0066B3]" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Headers HTTP</h3>
            <p className="text-gray-600 text-sm">
              Vérification des en-têtes de sécurité CSP, X-Frame-Options, CORS
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-[#0066B3] transition-colors">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <Search className="w-5 h-5 text-[#0066B3]" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Cookies & Session</h3>
            <p className="text-gray-600 text-sm">
              Analyse des attributs Secure, HttpOnly, SameSite
            </p>
          </div>
        </div>

        {/* Warning Box */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Avertissement important
              </h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-gray-500 rounded-full mt-2 flex-shrink-0" />
                  <span>Analyses passives et non-destructives par défaut</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-gray-500 rounded-full mt-2 flex-shrink-0" />
                  <span>Mode laboratoire réservé aux environnements locaux autorisés</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-gray-500 rounded-full mt-2 flex-shrink-0" />
                  <span>Respect des lois et autorisations nécessaires obligatoire</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-gray-500 rounded-full mt-2 flex-shrink-0" />
                  <span>Outil pédagogique - complémentaire aux audits professionnels</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}