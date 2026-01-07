
import React from 'react';
import Layout from '../components/Layout';

const TermsConditions: React.FC = () => {
  return (
    <Layout title="Terms of Service">
      <div className="space-y-8 pb-10">
        <section className="glass p-6 rounded-[24px] border border-white/5">
          <h3 className="text-[#13ec5b] font-black text-lg mb-3">1. Acceptance of Terms</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            By accessing Emerald Rewards, you agree to be bound by these Terms of Service. If you do not agree, please do not use the application.
          </p>
        </section>

        <section className="glass p-6 rounded-[24px] border border-white/5">
          <h3 className="text-[#13ec5b] font-black text-lg mb-3">2. Earning Points</h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-4">
            Points are awarded for valid ad views. Any attempt to manipulate the point system using bots, scripts, or automated tools will result in an immediate permanent ban.
          </p>
          <ul className="text-gray-500 text-xs space-y-2 list-disc pl-4">
            <li>One account per user/device only.</li>
            <li>VPN usage is strictly prohibited.</li>
            <li>Ad-blockers must be disabled to earn points.</li>
          </ul>
        </section>

        <section className="glass p-6 rounded-[24px] border border-white/5">
          <h3 className="text-[#13ec5b] font-black text-lg mb-3">3. Redemption Policy</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Redemptions are processed within 24-48 business hours. We reserve the right to audit accounts before fulfilling any withdrawal requests to ensure compliance with our anti-cheat policy.
          </p>
        </section>

        <section className="glass p-6 rounded-[24px] border border-white/5">
          <h3 className="text-[#13ec5b] font-black text-lg mb-3">4. Google AdMob Usage</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            This application uses Google AdMob to provide rewarded video advertisements. Points are only credited upon the successful completion of the video ad as reported by the AdMob SDK.
          </p>
        </section>

        <div className="text-center py-6">
          <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">Last Updated: October 2023</p>
        </div>
      </div>
    </Layout>
  );
};

export default TermsConditions;
