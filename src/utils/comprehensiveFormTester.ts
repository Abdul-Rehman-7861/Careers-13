// Comprehensive form testing and validation system
import { FormTester } from './formTesting';
import { testDatabaseConnection } from '../lib/supabase';

export class ComprehensiveFormTester {
  static async runFullSystemTest(): Promise<{
    overall: boolean;
    database: boolean;
    email: boolean;
    forms: { contact: boolean; project: boolean; job: boolean };
    details: any;
  }> {
    console.log('🧪 Starting comprehensive form system test...');
    
    const results = {
      overall: false,
      database: false,
      email: false,
      forms: { contact: false, project: false, job: false },
      details: {}
    };

    try {
      // Test database connection
      console.log('🔍 Testing database connection...');
      results.database = await testDatabaseConnection();
      console.log(`${results.database ? '✅' : '❌'} Database: ${results.database ? 'Connected' : 'Failed'}`);

      // Test email service
      console.log('🔍 Testing email service...');
      results.email = await this.testEmailService();
      console.log(`${results.email ? '✅' : '❌'} Email: ${results.email ? 'Working' : 'Failed'}`);

      // Test all forms
      console.log('🔍 Testing form validations...');
      const formTests = await FormTester.runAllFormTests();
      results.forms.contact = formTests.details.find((t: any) => t.name === 'Contact Form')?.passed || false;
      results.forms.project = formTests.details.find((t: any) => t.name === 'Project Builder')?.passed || false;
      results.forms.job = formTests.details.find((t: any) => t.name === 'Job Application')?.passed || false;

      results.details = {
        databaseConnection: results.database,
        emailService: results.email,
        formValidations: formTests.details,
        timestamp: new Date().toISOString()
      };

      // Overall status
      results.overall = results.database && results.email && 
                      results.forms.contact && results.forms.project && results.forms.job;

      console.log(`🧪 System test completed: ${results.overall ? 'ALL SYSTEMS OPERATIONAL' : 'ISSUES DETECTED'}`);
      
      return results;
    } catch (error) {
      console.error('❌ Comprehensive test failed:', error);
      results.details.error = error.message;
      return results;
    }
  }

  private static async testEmailService(): Promise<boolean> {
    try {
      const response = await fetch('/api/health-check');
      if (!response.ok) return false;
      
      const result = await response.json();
      return result.success && result.data?.services?.email?.status === 'healthy';
    } catch (error) {
      console.error('Email service test failed:', error);
      return false;
    }
  }

  static async testFormSubmission(formType: 'contact' | 'project' | 'job', testData: any): Promise<boolean> {
    try {
      console.log(`🧪 Testing ${formType} form submission...`);
      
      const endpoints = {
        contact: '/api/contact',
        project: '/api/project-builder',
        job: '/api/job-application'
      };

      const response = await fetch(endpoints[formType], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log(`✅ ${formType} form submission test passed`);
        return true;
      } else {
        console.error(`❌ ${formType} form submission test failed:`, result.message);
        return false;
      }
    } catch (error) {
      console.error(`❌ ${formType} form submission test error:`, error);
      return false;
    }
  }

  static generateTestReport(results: any): string {
    const timestamp = new Date().toLocaleString();
    
    return `
# Nexariza AI - Form Integration Test Report
Generated: ${timestamp}

## Overall Status: ${results.overall ? '✅ ALL SYSTEMS OPERATIONAL' : '❌ ISSUES DETECTED'}

## System Components:
- Database Connection: ${results.database ? '✅ Working' : '❌ Failed'}
- Email Service: ${results.email ? '✅ Working' : '❌ Failed'}

## Form Validations:
- Contact Form: ${results.forms.contact ? '✅ Valid' : '❌ Issues'}
- Project Builder: ${results.forms.project ? '✅ Valid' : '❌ Issues'}
- Job Applications: ${results.forms.job ? '✅ Valid' : '❌ Issues'}

## Test Details:
${JSON.stringify(results.details, null, 2)}

## Next Steps:
${results.overall 
  ? '🚀 All systems are working correctly. Forms are ready for production use.'
  : '🔧 Please address the issues above before deploying to production.'
}

---
Nexariza AI Form Integration Testing System
    `;
  }
}

// Auto-run tests in development
if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.addEventListener('load', async () => {
    setTimeout(async () => {
      console.log('🧪 Auto-running form system tests...');
      const results = await ComprehensiveFormTester.runFullSystemTest();
      
      if (results.overall) {
        console.log('🎉 All form systems are working correctly!');
      } else {
        console.warn('⚠️ Some form systems need attention:', results.details);
      }
    }, 3000);
  });
}

export default ComprehensiveFormTester;