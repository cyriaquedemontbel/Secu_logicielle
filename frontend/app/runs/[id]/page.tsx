'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { 
  getScanStatus, 
  getScanFindings, 
  getReportUrl,
  StatusResponse, 
  Finding,
  ApiError 
} from '@/lib/api';
import FindingsTable from '@/components/FindingsTable';
import FindingDetail from '@/components/FindingDetail';
import ProgressBar from '@/components/ProgressBar';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  ArrowLeft,
  Shield,
  ExternalLink,
  X,
  BarChart3,
  Target
} from 'lucide-react';

export default function RunPage() {
  const params = useParams();
  const runId = params.id as string;

  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(true);
  const [severityCounts, setSeverityCounts] = useState<Record<string, number>>({
    Critical: 0,
    High: 0,
    Medium: 0,
    Low: 0,
    Info: 0
  });

  const fetchStatus = useCallback(async () => {
    try {
      const statusData = await getScanStatus(runId);
      setStatus(statusData);

      if (statusData.status === 'finished' || statusData.status === 'failed') {
        setIsPolling(false);
        
        if (statusData.status === 'finished') {
          const findingsData = await getScanFindings(runId);
          setFindings(findingsData.findings);
          
          const counts = { Critical: 0, High: 0, Medium: 0, Low: 0, Info: 0 };
          findingsData.findings.forEach((f) => {
            counts[f.severity] = (counts[f.severity] || 0) + 1;
          });
          setSeverityCounts(counts);
        }
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Impossible de récupérer le statut du scan.');
      }
      setIsPolling(false);
    }
  }, [runId]);

  useEffect(() => {
    fetchStatus();

    if (isPolling) {
      const interval = setInterval(fetchStatus, 2000);
      return () => clearInterval(interval);
    }
  }, [fetchStatus, isPolling]);

  const getStatusConfig = () => {
    switch (status?.status) {
      case 'queued':
        return {
          text: 'En attente',
          icon: Clock,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-300'
        };
      case 'running':
        return {
          text: 'Scan en cours...',
          icon: BarChart3,
          color: 'text-[#0066B3]',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case 'finished':
        return {
          text: 'Scan terminé',
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'failed':
        return {
          text: 'Échec du scan',
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      default:
        return {
          text: 'Statut inconnu',
          icon: AlertTriangle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-300'
        };
    }
  };

  const getSeverityConfig = (severity: string) => {
    const configs: Record<string, any> = {
      Critical: {
        label: 'Critique',
        color: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        countColor: 'text-red-600'
      },
      High: {
        label: 'Élevée',
        color: 'text-orange-700',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        countColor: 'text-orange-600'
      },
      Medium: {
        label: 'Moyenne',
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        countColor: 'text-yellow-600'
      },
      Low: {
        label: 'Faible',
        color: 'text-blue-700',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        countColor: 'text-blue-600'
      },
      Info: {
        label: 'Information',
        color: 'text-gray-700',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        countColor: 'text-gray-600'
      }
    };
    return configs[severity] || configs.Info;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Erreur</h2>
                <p className="text-gray-700 mb-6">{error}</p>
                <a
                  href="/"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#0066B3] text-white rounded-lg hover:bg-[#005A9E] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour à l'accueil
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-[#0066B3] rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-700">Chargement du scan...</p>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Nouveau scan</span>
          </a>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 ${statusConfig.bgColor} border ${statusConfig.borderColor} rounded-lg flex items-center justify-center`}>
                  <StatusIcon className={`w-6 h-6 ${statusConfig.color}`} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{statusConfig.text}</h1>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Target className="w-4 h-4" />
                      <span>Cible:</span>
                      <code className="px-2 py-1 bg-gray-100 rounded border border-gray-200 font-mono text-sm">
                        {status.target_url}
                      </code>
                    </div>
                    {typeof status.lab_mode === 'boolean' && (
                      <div className={`px-2 py-1 rounded text-xs ${
                        status.lab_mode 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {status.lab_mode ? 'Mode Laboratoire' : 'Mode Passif'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-gray-500 text-sm">
                ID: <span className="font-mono">{runId}</span>
              </p>
            </div>

            {status.status === 'finished' && (
              <a
                href={getReportUrl(runId)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-3 bg-[#0066B3] text-white rounded-lg hover:bg-[#005A9E] transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger le rapport</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {(status.status === 'queued' || status.status === 'running') && (
          <div className="mb-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-[#0066B3]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Progression du scan</h3>
                    <p className="text-sm text-gray-500">Analyse en cours</p>
                  </div>
                </div>
                <span className="text-xl font-bold text-gray-900">{status.progress}%</span>
              </div>
              <ProgressBar progress={status.progress} status={status.status} />
            </div>
          </div>
        )}

        {/* Error Message */}
        {status.status === 'failed' && status.error_message && (
          <div className="mb-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-red-100 rounded flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Message d'erreur</h3>
                  <p className="text-gray-700 bg-white p-3 rounded border border-red-100">
                    {status.error_message}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {status.status === 'finished' && (
          <>
            {/* Summary Cards */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                  <Shield className="w-4 h-4 text-[#0066B3]" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Résumé de sécurité</h2>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {Object.entries(severityCounts).map(([severity, count]) => {
                  const config = getSeverityConfig(severity);
                  
                  return (
                    <div
                      key={severity}
                      className={`${config.bgColor} border ${config.borderColor} rounded-lg p-4`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-medium ${config.color}`}>
                          {config.label}
                        </span>
                      </div>
                      <div className={`text-3xl font-bold ${config.countColor}`}>
                        {count}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Total des vulnérabilités :{' '}
                  <span className="font-bold text-gray-900">
                    {findings.length}
                  </span>
                </p>
              </div>
            </div>

            {/* Findings Table */}
            <div className="mb-8">
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="border-b border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4 text-[#0066B3]" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">
                          Vulnérabilités détectées
                        </h2>
                        <p className="text-sm text-gray-500">
                          {findings.length} problème{findings.length !== 1 ? 's' : ''} identifié{findings.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    {selectedFinding && (
                      <button
                        onClick={() => setSelectedFinding(null)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    )}
                  </div>
                </div>

                {findings.length > 0 ? (
                  <div className="p-6">
                    <FindingsTable
                      findings={findings}
                      onSelectFinding={setSelectedFinding}
                      selectedFinding={selectedFinding}
                    />
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-50 border border-green-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Aucune vulnérabilité détectée
                    </h3>
                    <p className="text-gray-600">
                      Le scan n'a pas trouvé de problèmes de sécurité évidents.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Finding Detail */}
            {selectedFinding && (
              <div>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="border-b border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 ${getSeverityConfig(selectedFinding.severity).bgColor} border ${getSeverityConfig(selectedFinding.severity).borderColor} rounded flex items-center justify-center`}>
                          <AlertTriangle className={`w-4 h-4 ${getSeverityConfig(selectedFinding.severity).color}`} />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-gray-900">
                            Détails de la vulnérabilité
                          </h2>
                          <p className="text-sm text-gray-500">
                            {selectedFinding.title} • {getSeverityConfig(selectedFinding.severity).label}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedFinding(null)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <FindingDetail finding={selectedFinding} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}