// Comprehensive form testing utilities
export class FormTester {
  static async testContactForm(): Promise<boolean> {
    try {
      console.log('🧪 Testing Contact Form...');
      
      const testData = {
        name: 'Test User',
        email: 'test@example.com',
        company: 'Test Company',
        service: 'Custom AI/ML Development',
        message: 'This is a test message to verify form functionality.'
      };

      // Test client-side validation
      const { FormValidator } = await import('./formValidation');
      const validation = FormValidator.validateContactForm(testData);
      
      if (!validation.isValid) {
        console.error('❌ Contact form validation failed:', validation.errors);
        return false;
      }

      console.log('✅ Contact form validation passed');
      return true;
    } catch (error) {
      console.error('❌ Contact form test failed:', error);
      return false;
    }
  }

  static async testProjectBuilder(): Promise<boolean> {
    try {
      console.log('🧪 Testing Project Builder...');
      
      const testData = {
        projectType: 'chatbot',
        industry: 'Healthcare',
        budget: '$15,000 - $50,000',
        timeline: '2-4 months',
        features: ['Real-time Processing', 'Multi-language Support'],
        description: 'Test project description',
        contactInfo: {
          name: 'Test User',
          email: 'test@example.com',
          company: 'Test Company'
        }
      };

      const { FormValidator } = await import('./formValidation');
      const validation = FormValidator.validateProjectForm(testData);
      
      if (!validation.isValid) {
        console.error('❌ Project builder validation failed:', validation.errors);
        return false;
      }

      console.log('✅ Project builder validation passed');
      return true;
    } catch (error) {
      console.error('❌ Project builder test failed:', error);
      return false;
    }
  }

  static async testJobApplication(): Promise<boolean> {
    try {
      console.log('🧪 Testing Job Application...');
      
      const testData = {
        full_name: 'Test Candidate',
        email: 'candidate@example.com',
        phone: '+1234567890',
        cover_letter: 'This is a comprehensive test cover letter that meets the minimum length requirements for validation.',
        experience_years: 5,
        skills: ['JavaScript', 'React', 'AI/ML'],
        availability: 'immediate'
      };

      const { FormValidator } = await import('./formValidation');
      const validation = FormValidator.validateJobApplication(testData);
      
      if (!validation.isValid) {
        console.error('❌ Job application validation failed:', validation.errors);
        return false;
      }

      console.log('✅ Job application validation passed');
      return true;
    } catch (error) {
      console.error('❌ Job application test failed:', error);
      return false;
    }
  }

  static async runAllFormTests(): Promise<{ passed: number; total: number; details: any }> {
    console.log('🧪 Running comprehensive form tests...');
    
    const tests = [
      { name: 'Contact Form', test: this.testContactForm },
      { name: 'Project Builder', test: this.testProjectBuilder },
      { name: 'Job Application', test: this.testJobApplication }
    ];

    const results = [];
    let passed = 0;

    for (const test of tests) {
      try {
        const result = await test.test();
        results.push({ name: test.name, passed: result });
        if (result) passed++;
      } catch (error) {
        results.push({ name: test.name, passed: false, error: error.message });
      }
    }

    console.log(`🧪 Form tests completed: ${passed}/${tests.length} passed`);
    
    return {
      passed,
      total: tests.length,
      details: results
    };
  }
}

export default FormTester;