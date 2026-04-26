export const metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for FilmyMela - Rules and guidelines for using our platform.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-red-600">Terms of Service</h1>
        
        <div className="space-y-6 text-gray-300">
          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing and using FilmyMela, you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">2. Use of Service</h2>
            <p>
              FilmyMela provides a platform for discovering and streaming movies. 
              You agree to use the service only for lawful purposes and in accordance with these terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">3. User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account 
              credentials and for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">4. Intellectual Property</h2>
            <p>
              All content on FilmyMela, including text, graphics, logos, and software, 
              is the property of FilmyMela or its content suppliers and is protected by copyright laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">5. Prohibited Activities</h2>
            <p>
              Users may not: (a) use the service for any illegal purpose; (b) attempt 
              to gain unauthorized access to any part of the service; (c) interfere with 
              the proper working of the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">6. Termination</h2>
            <p>
              We reserve the right to terminate or suspend your account at any time 
              for any reason, including violation of these terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">7. Disclaimer</h2>
            <p>
              FilmyMela is provided &quot;as is&quot; without warranties of any kind. 
              We do not guarantee uninterrupted or error-free service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">8. Changes to Terms</h2>
            <p>
              We may modify these terms at any time. Continued use of the service after 
              changes constitutes acceptance of the new terms.
            </p>
          </section>

          <p className="text-sm text-gray-500 pt-4">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
