import React from 'react';
import { DataProvenance } from '../../types';
import { UserCheck, Stethoscope, FileUp, Activity, Sparkles } from 'lucide-react';

interface ProvenanceBadgeProps {
  source: DataProvenance;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

export const ProvenanceBadge: React.FC<ProvenanceBadgeProps> = ({ 
  source, 
  showIcon = true,
  size = 'sm'
}) => {
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';

  switch (source) {
    case 'doctor_verified':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
          {showIcon && <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />}
          Doctor Verified
        </span>
      );

    case 'uploaded_document':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}>
          {showIcon && <FileUp className="w-3.5 h-3.5 text-blue-600" />}
          Uploaded Document
        </span>
      );

    case 'patient_provided':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}>
          {showIcon && <UserCheck className="w-3.5 h-3.5 text-amber-600" />}
          Patient Self-Reported
        </span>
      );

    case 'device_data':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-purple-50 text-purple-700 border border-purple-200 ${sizeClasses}`}>
          {showIcon && <Activity className="w-3.5 h-3.5 text-purple-600" />}
          Medical Device Sensor
        </span>
      );

    case 'ai_extracted':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 ${sizeClasses}`}>
          {showIcon && <Sparkles className="w-3.5 h-3.5 text-indigo-600" />}
          AI Extracted (Unverified)
        </span>
      );

    default:
      return null;
  }
};
