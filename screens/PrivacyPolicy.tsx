
import React from 'react';
import Layout from '../components/Layout';

const PrivacyPolicy: React.FC = () => {
  return (
    <Layout title="Privacy Policy">
      <div className="space-y-8 pb-10">
        <section className="glass p-6 rounded-[24px] border border-white/5">
          <h3 className="text-[#13ec5b] font-black text-lg mb-3">Data Collection</h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-4">
            We collect basic information through Google Sign-In to manage your reward account:
          </p>
          <ul className="text-gray-500 text-xs space-y-2 list-disc pl-4">
            <li>Your full name and profile picture.</li>
            <li>Your email address for reward delivery.</li>
            <li>Device identifiers to prevent fraudulent activity.</li>
          </ul>
        </section>

        <section className="glass p-6 rounded-[24px] border border-white/5">
          <h3 className="text-[#13ec5b] font-black text-lg mb-3">How We Use Information</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Your data is used solely for point tracking, fraud prevention, and communicating about your withdrawal requests. We never sell your personal data to third parties.
          </p>
        </section>

        <section className="glass p-6 rounded-[24px] border border-white/5">
          <h3 className="text-[#13ec5b] font-black text-lg mb-3">AdMob & Data</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            We use **Google AdMob** for advertising. Google may use advertising IDs and cookies to serve personalized ads based on your interests. By using this app, you consent to Google's data processing as described in their partner policy.
          </p>
        </section>

        <section className="glass p-6 rounded-[24px] border border-white/5">
          <h3 className="text-[#13ec5b] font-black text-lg mb-3">Security</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            We implement industry-standard encryption and Firebase security rules to protect your data. However, no method of electronic storage is 100% secure.
          </p>
        </section>

        <div className="text-center py-6">
          <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">Version 1.0.2 • AdMob Integrated</p>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;
