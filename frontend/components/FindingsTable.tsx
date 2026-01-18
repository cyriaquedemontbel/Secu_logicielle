import { Finding } from '@/lib/api';
import { AlertTriangle, ChevronRight, FileText, Globe } from 'lucide-react';

interface FindingsTableProps {
  findings: Finding[];
  onSelectFinding: (finding: Finding) => void;
  selectedFinding: Finding | null;
}

export default function FindingsTable({
  findings,
  onSelectFinding,
  selectedFinding,
}: FindingsTableProps) {
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

  const sortedFindings = [...findings].sort((a, b) => {
    const severityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3, Info: 4 };
    return (severityOrder[a.severity] ?? 5) - (severityOrder[b.severity] ?? 5);
  });

  return (
    <div className="overflow-hidden border border-gray-200 rounded-lg">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="border-b border-gray-200">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Sévérité
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Description
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Catégorie
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedFindings.map((finding) => {
              const config = getSeverityConfig(finding.severity);
              const isSelected = selectedFinding?.id === finding.id;
              
              return (
                <tr
                  key={finding.id}
                  onClick={() => onSelectFinding(finding)}
                  className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                    isSelected ? 'bg-blue-50' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 ${config.bgColor} border ${config.borderColor} rounded flex items-center justify-center`}>
                        <AlertTriangle className={`w-4 h-4 ${config.color}`} />
                      </div>
                      <div>
                        <span className={`inline-block px-3 py-1 rounded text-xs font-semibold ${config.badgeColor}`}>
                          {config.label}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          {finding.source}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-md">
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {finding.summary}
                      </div>
                      <div className="text-xs text-gray-500 line-clamp-2">
                        {finding.asset.value}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded border border-gray-200">
                      {finding.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded border border-gray-200 font-mono">
                      {finding.id}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded border border-gray-200 font-mono">
                        {finding.check}
                      </code>
                      <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-[#0066B3]' : 'text-gray-400'}`} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {sortedFindings.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune vulnérabilité détectée
          </h3>
          <p className="text-gray-500 text-sm">
            Tous les tests de sécurité sont passés avec succès
          </p>
        </div>
      )}
    </div>
  );
}