import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, Database, Mail, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { testDatabaseConnection } from '../lib/supabase';

interface FormStatusIndicatorProps {
  formType: 'contact' | 'project' | 'job';
  className?: string;
}

const FormStatusIndicator: React.FC<FormStatusIndicatorProps> = ({ formType, className = '' }) => {
  const [status, setStatus] = useState({
    database: false,
    email: false,
    testing: false
  });

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    setStatus(prev => ({ ...prev, testing: true }));
    
    try {
      // Test database connection
      const dbStatus = await testDatabaseConnection();
      
      // Test email service
      const emailStatus = await testEmailService();
      
      setStatus({
        database: dbStatus,
        email: emailStatus,
        testing: false
      });
    } catch (error) {
      console.error('System status check failed:', error);
      setStatus(prev => ({ ...prev, testing: false }));
    }
  };

  const testEmailService = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/health-check');
      const result = await response.json();
      return result.success && result.data?.services?.email?.status === 'healthy';
    } catch (error) {
      return false;
    }
  };

  const getFormEndpoint = () => {
    switch (formType) {
      case 'contact': return '/api/contact';
      case 'project': return '/api/project-builder';
      case 'job': return '/api/job-application';
      default: return '/api/contact';
    }
  };

  const getFormTable = () => {
    switch (formType) {
      case 'contact': return 'contact_submissions';
      case 'project': return 'project_submissions';
      case 'job': return 'job_applications';
      default: return 'contact_submissions';
    }
  };

  return (
    <div className={`bg-gray-800/50 rounded-lg p-4 border border-gray-700 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold text-sm">Form System Status</h3>
        <button
          onClick={checkSystemStatus}
          disabled={status.testing}
          className="text-blue-400 hover:text-blue-300 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${status.testing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="h-4 w-4 text-gray-400" />
            <span className="text-gray-300 text-sm">Database ({getFormTable()})</span>
          </div>
          <div className="flex items-center space-x-1">
            {status.database ? (
              <CheckCircle className="h-4 w-4 text-green-400" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-400" />
            )}
            <span className={`text-xs ${status.database ? 'text-green-400' : 'text-red-400'}`}>
              {status.database ? 'Connected' : 'Failed'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-gray-400" />
            <span className="text-gray-300 text-sm">Email Service</span>
          </div>
          <div className="flex items-center space-x-1">
            {status.email ? (
              <CheckCircle className="h-4 w-4 text-green-400" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-400" />
            )}
            <span className={`text-xs ${status.email ? 'text-green-400' : 'text-red-400'}`}>
              {status.email ? 'Working' : 'Failed'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wifi className="h-4 w-4 text-gray-400" />
            <span className="text-gray-300 text-sm">API Endpoint</span>
          </div>
          <span className="text-xs text-blue-400">{getFormEndpoint()}</span>
        </div>
      </div>

      {(!status.database || !status.email) && (
        <div className="mt-3 p-2 bg-yellow-900/20 border border-yellow-700/30 rounded text-xs text-yellow-300">
          <p className="font-semibold">⚠️ System Status:</p>
          {!status.database && <p>• Database connection issues detected</p>}
          {!status.email && <p>• Email service may be unavailable</p>}
          <p className="mt-1 text-yellow-400">Forms will continue working with fallback handling.</p>
        </div>
      )}

      {status.database && status.email && (
        <div className="mt-3 p-2 bg-green-900/20 border border-green-700/30 rounded text-xs text-green-300">
          <p className="flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" />
            All systems operational - forms ready for submissions
          </p>
        </div>
      )}
    </div>
  );
};

export default FormStatusIndicator;