import { Finding } from '@/lib/api';
import { AlertTriangle, Globe, Code, Shield, FileText } from 'lucide-react';

interface FindingDetailProps {
  finding: Finding;
}

export default function FindingDetail({ finding }: FindingDetailProps) {
  const getSeverityConfig = (severity: string) => {
    const configs: Record<string, any> = {
      Critical: {
        label: 'Critique',
        color: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        badgeColor: 'bg-red-600 text-white'
      },
      High: {
        label: 'Élevée',
        color: 'text-orange-700',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        badgeColor: 'bg-orange-500 text-white'
      },
      Medium: {
        label: 'Moyenne',
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        badgeColor: 'bg-yellow-500 text-gray-900'
      },
      Low: {
        label: 'Faible',
        color: 'text-blue-700',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        badgeColor: 'bg-blue-500 text-white'
      },
      Info: {
        label: 'Information',
        color: 'text-gray-700',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        badgeColor: 'bg-gray-200 text-gray-900 border border-gray-300'
      }
    };
    return configs[severity] || configs.Info;
  };

  const config = getSeverityConfig(finding.severity);

  return (
    <div className={`border-l-4 ${config.borderColor} p-6 rounded-r-lg ${config.bgColor}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white border border-gray-200 rounded flex items-center justify-center">
            <Code className="w-4 h-4 text-gray-600" />
          </div>
          <code className="bg-white px-3 py-1 rounded border border-gray-300 text-sm font-mono">
            {finding.id}
          </code>
        </div>
        <span className={`px-3 py-1 rounded text-sm font-semibold ${config.badgeColor}`}>
          {config.label}
        </span>
        <span className="text-gray-600 text-sm bg-white px-3 py-1 rounded border border-gray-200">
          {finding.category}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
        {finding.summary}
      </h3>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Asset */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-[#0066B3]" />
              <h4 className="text-sm font-semibold text-gray-900">Asset affecté</h4>
            </div>
            <div className="space-y-2">
              <div className="text-xs text-gray-500">Type</div>
              <div className="text-sm font-medium text-gray-900">{finding.asset.type}</div>
              <div className="text-xs text-gray-500 mt-3">Valeur</div>
              <code className="block bg-gray-50 px-3 py-2 rounded border border-gray-300 text-sm break-all font-mono">
                {finding.asset.value}
              </code>
            </div>
          </div>

          {/* Source */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-[#0066B3]" />
              <h4 className="text-sm font-semibold text-gray-900">Source</h4>
            </div>
            <div className="space-y-2">
              <div className="text-xs text-gray-500">Module</div>
              <div className="text-sm font-medium text-gray-900">{finding.source}</div>
              <div className="text-xs text-gray-500 mt-3">Check ID</div>
              <code className="block bg-gray-50 px-3 py-2 rounded border border-gray-300 text-sm font-mono">
                {finding.check}
              </code>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Evidence */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-[#0066B3]" />
              <h4 className="text-sm font-semibold text-gray-900">Preuves techniques</h4>
            </div>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm whitespace-pre-wrap font-mono">
              {finding.evidence.details || 'Aucun détail disponible'}
            </pre>
          </div>

          {/* Headers if available */}
          {finding.evidence.headers && Object.keys(finding.evidence.headers).length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">En-têtes HTTP</h4>
              <div className="bg-gray-50 rounded border border-gray-300 p-3 overflow-x-auto">
                <table className="text-sm w-full">
                  <tbody className="divide-y divide-gray-200">
                    {Object.entries(finding.evidence.headers).map(([key, value]) => (
                      <tr key={key}>
                        <td className="py-2 pr-4 font-mono text-gray-600 whitespace-nowrap">{key}:</td>
                        <td className="py-2 font-mono text-gray-900 break-all">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Remediation - Full width */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-[#0066B3]" />
            <h4 className="text-lg font-semibold text-gray-900">Recommandations de correction</h4>
          </div>
          <div className="space-y-3">
            {finding.remediation.map((rec, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-[#0066B3] text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                <p className="text-gray-700 flex-1">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}