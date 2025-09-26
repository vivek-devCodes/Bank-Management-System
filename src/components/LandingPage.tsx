import React from 'react';
import { 
  Shield, 
  CreditCard, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  ArrowRight,
  Building2,
  Lock,
  Smartphone,
  Globe
} from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
  onSignup: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onSignup }) => {
  const features = [
    {
      icon: Shield,
      title: 'Bank-Grade Security',
      description: 'Your money and data are protected with enterprise-level encryption and security protocols.'
    },
    {
      icon: CreditCard,
      title: 'Multiple Account Types',
      description: 'Choose from checking, savings, and business accounts tailored to your financial needs.'
    },
    {
      icon: TrendingUp,
      title: 'Investment Tools',
      description: 'Grow your wealth with our comprehensive investment and savings products.'
    },
    {
      icon: Smartphone,
      title: 'Mobile Banking',
      description: 'Access your accounts anytime, anywhere with our secure mobile banking platform.'
    }
  ];

  const stats = [
    { number: '500K+', label: 'Satisfied Customers' },
    { number: '$2.5B+', label: 'Assets Under Management' },
    { number: '99.9%', label: 'Uptime Guarantee' },
    { number: '24/7', label: 'Customer Support' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">SecureBank Pro</h1>
            </div>
            <div className="flex gap-4">
              <button
                onClick={onLogin}
                className="px-6 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
              >
                Sign In
              </button>
              <button
                onClick={onSignup}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Banking Made
              <span className="text-blue-600 block">Simple & Secure</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Experience the future of banking with our comprehensive management system. 
              Secure transactions, real-time analytics, and 24/7 access to your financial world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onSignup}
                className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                Open Account Today
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={onLogin}
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-600 hover:text-blue-600 transition-colors font-semibold text-lg"
              >
                Access Your Account
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Why Choose SecureBank Pro?</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We combine cutting-edge technology with personalized service to deliver 
              an exceptional banking experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow duration-300 border border-gray-100">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h4>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-6">Your Security is Our Priority</h3>
              <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                We employ the latest security technologies and follow industry best practices 
                to ensure your financial information remains safe and secure.
              </p>
              <div className="space-y-4">
                {[
                  'End-to-end encryption for all transactions',
                  'Multi-factor authentication',
                  'Real-time fraud monitoring',
                  'FDIC insured up to $250,000'
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span className="text-blue-100">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <Lock className="h-24 w-24 text-white mx-auto mb-4" />
                <div className="text-center">
                  <div className="text-2xl font-bold mb-2">256-bit SSL</div>
                  <div className="text-blue-200">Bank-grade encryption</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-gray-900 mb-6">Ready to Get Started?</h3>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of satisfied customers who trust SecureBank Pro with their financial future.
          </p>
          <button
            onClick={onSignup}
            className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-flex items-center gap-2"
          >
            Open Your Account Now
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="h-6 w-6 text-blue-400" />
                <span className="text-lg font-bold">SecureBank Pro</span>
              </div>
              <p className="text-gray-400">
                Your trusted partner in financial management and growth.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Personal Banking</li>
                <li>Business Banking</li>
                <li>Investment Services</li>
                <li>Loans & Credit</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Security Center</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="flex gap-4">
                <Globe className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 SecureBank Pro. All rights reserved. Member FDIC.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;