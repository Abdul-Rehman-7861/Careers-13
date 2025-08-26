// Form testing API endpoint for debugging and validation
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      message: 'Method not allowed. Use POST.' 
    });
  }

  try {
    const { formType, testData } = req.body;
    
    console.log(`🧪 Testing ${formType} form integration...`);
    
    const testResults = {
      formType,
      timestamp: new Date().toISOString(),
      database: { status: 'unknown', error: null },
      email: { status: 'unknown', error: null },
      validation: { status: 'unknown', errors: [] },
      overall: false
    };

    // Test database connection and operations
    try {
      console.log('🔍 Testing database connection...');
      
      const tables = {
        contact: 'contact_submissions',
        project: 'project_submissions', 
        job: 'job_applications'
      };
      
      const tableName = tables[formType] || 'contact_submissions';
      
      const { data, error } = await supabase
        .from(tableName)
        .select('id')
        .limit(1);
      
      if (error) {
        testResults.database = { status: 'failed', error: error.message };
      } else {
        testResults.database = { status: 'working', error: null };
      }
    } catch (dbError) {
      testResults.database = { status: 'failed', error: dbError.message };
    }

    // Test email service
    try {
      console.log('🔍 Testing email service...');
      
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.default.createTransporter({
        host: process.env.SMTP_HOST || 'smtpout.secureserver.net',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER || 'contact@nexariza.com',
          pass: process.env.SMTP_PASS || 'Nexariza@Ahmad1122'
        },
        tls: { rejectUnauthorized: false }
      });

      await transporter.verify();
      testResults.email = { status: 'working', error: null };
    } catch (emailError) {
      testResults.email = { status: 'failed', error: emailError.message };
    }

    // Test form validation
    try {
      console.log('🔍 Testing form validation...');
      
      const validationErrors = [];
      
      if (formType === 'contact') {
        if (!testData.name) validationErrors.push('Name is required');
        if (!testData.email) validationErrors.push('Email is required');
        if (!testData.message) validationErrors.push('Message is required');
      } else if (formType === 'project') {
        if (!testData.projectType) validationErrors.push('Project type is required');
        if (!testData.industry) validationErrors.push('Industry is required');
        if (!testData.budget) validationErrors.push('Budget is required');
        if (!testData.contactInfo?.name) validationErrors.push('Contact name is required');
        if (!testData.contactInfo?.email) validationErrors.push('Contact email is required');
      } else if (formType === 'job') {
        if (!testData.full_name) validationErrors.push('Full name is required');
        if (!testData.email) validationErrors.push('Email is required');
        if (!testData.cover_letter) validationErrors.push('Cover letter is required');
      }
      
      testResults.validation = {
        status: validationErrors.length === 0 ? 'valid' : 'invalid',
        errors: validationErrors
      };
    } catch (validationError) {
      testResults.validation = { status: 'failed', errors: [validationError.message] };
    }

    // Determine overall status
    testResults.overall = testResults.database.status === 'working' && 
                         testResults.email.status === 'working' && 
                         testResults.validation.status === 'valid';

    console.log(`🧪 ${formType} form test completed:`, testResults.overall ? 'PASSED' : 'FAILED');

    return res.status(200).json({
      success: true,
      message: `${formType} form test completed`,
      data: testResults
    });

  } catch (error) {
    console.error('❌ Form test failed:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Form test failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}