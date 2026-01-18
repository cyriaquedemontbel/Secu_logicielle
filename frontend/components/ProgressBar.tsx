import { Clock, Play, CheckCircle, XCircle } from 'lucide-react';

interface ProgressBarProps {
  progress: number;
  status: 'queued' | 'running' | 'finished' | 'failed';
}

export default function ProgressBar({ progress, status }: ProgressBarProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'queued':
        return {
          icon: Clock,
          color: 'text-amber-600',
          bgColor: 'bg-amber-100',
          barColor: 'bg-amber-500'
        };
      case 'running':
        return {
          icon: Play,
          color: 'text-[#0066B3]',
          bgColor: 'bg-blue-50',
          barColor: 'bg-[#0066B3]'
        };
      case 'finished':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          barColor: 'bg-green-500'
        };
      case 'failed':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          barColor: 'bg-red-500'
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          barColor: 'bg-gray-500'
        };
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'queued': return 'En attente de démarrage';
      case 'running': return 'Analyse en cours';
      case 'finished': return 'Scan terminé';
      case 'failed': return 'Scan échoué';
      default: return 'Statut inconnu';
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${config.bgColor} rounded-lg flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${config.color}`} />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{getStatusText()}</h3>
            <p className="text-sm text-gray-500">
              Progression du scan de sécurité
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{progress}%</div>
          <div className="text-xs text-gray-500">complété</div>
        </div>
      </div>
      
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${config.barColor} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="flex justify-between text-xs text-gray-500">
        <div className="text-center">
          <div className="w-2 h-2 bg-gray-300 rounded-full mx-auto mb-1"></div>
          <span>Initialisation</span>
        </div>
        <div className="text-center">
          <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${progress >= 25 ? 'bg-[#0066B3]' : 'bg-gray-300'}`}></div>
          <span>Modules passifs</span>
        </div>
        <div className="text-center">
          <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${progress >= 50 ? 'bg-[#0066B3]' : 'bg-gray-300'}`}></div>
          <span>Scan actif</span>
        </div>
        <div className="text-center">
          <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${progress >= 75 ? 'bg-[#0066B3]' : 'bg-gray-300'}`}></div>
          <span>Analyse</span>
        </div>
        <div className="text-center">
          <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${progress >= 100 ? 'bg-[#0066B3]' : 'bg-gray-300'}`}></div>
          <span>Rapport</span>
        </div>
      </div>
    </div>
  );
}