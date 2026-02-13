import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getThreatColor(level: string): string {
  switch (level) {
    case 'critical':
      return 'text-red-400';
    case 'high':
      return 'text-orange-400';
    case 'medium':
      return 'text-yellow-400';
    case 'low':
      return 'text-blue-400';
    default:
      return 'text-slate-400';
  }
}

export function getThreatBgColor(level: string): string {
  switch (level) {
    case 'critical':
      return 'bg-red-900/40 border-red-700/50';
    case 'high':
      return 'bg-orange-900/40 border-orange-700/50';
    case 'medium':
      return 'bg-yellow-900/40 border-yellow-700/50';
    case 'low':
      return 'bg-blue-900/40 border-blue-700/50';
    default:
      return 'bg-slate-900/40 border-slate-700/50';
  }
}

export function getThreatLabel(level: string): string {
  switch (level) {
    case 'critical':
      return 'CRITICAL';
    case 'high':
      return 'HIGH';
    case 'medium':
      return 'MEDIUM';
    case 'low':
      return 'LOW';
    default:
      return 'UNKNOWN';
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'text-green-400';
    case 'completed':
      return 'text-blue-400';
    case 'paused':
      return 'text-yellow-400';
    default:
      return 'text-slate-400';
  }
}

export function getStatusBgColor(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-green-900/40 border-green-700/50';
    case 'completed':
      return 'bg-blue-900/40 border-blue-700/50';
    case 'paused':
      return 'bg-yellow-900/40 border-yellow-700/50';
    default:
      return 'bg-slate-900/40 border-slate-700/50';
  }
}

export function getDataSourceTypeColor(type: string): string {
  switch (type) {
    case 'ETW':
      return 'bg-purple-900/40 text-purple-300 border-purple-700/50';
    case 'Sysmon':
      return 'bg-cyan-900/40 text-cyan-300 border-cyan-700/50';
    case 'Network':
      return 'bg-teal-900/40 text-teal-300 border-teal-700/50';
    case 'Registry':
      return 'bg-indigo-900/40 text-indigo-300 border-indigo-700/50';
    case 'File':
      return 'bg-pink-900/40 text-pink-300 border-pink-700/50';
    default:
      return 'bg-slate-900/40 text-slate-300 border-slate-700/50';
  }
}
