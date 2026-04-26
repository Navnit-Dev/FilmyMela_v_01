export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for FilmyMela - Learn how we protect your data and privacy.',
};

export const dynamic = 'force-static';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-red-600">Privacy Policy</h1>
        
        <div className="space-y-6 text-gray-300">
          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">1. Information We Collect</h2>
            <p>
              FilmyMela collects information that you provide directly to us, including 
              when you create an account, use our services, or communicate with us. 
              This may include your name, email address, and usage preferences.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">2. How We Use Your Information</h2>
            <p>
              We use the information we collect to provide, maintain, and improve our 
              services, to communicate with you, and to personalize your experience on FilmyMela.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">3. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect 
              your personal data against unauthorized access, alteration, or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">4. Third-Party Services</h2>
            <p>
              We may use third-party services to help operate our platform. These 
              services have their own privacy policies and we encourage you to review them.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">5. Your Rights</h2>
            <p>
              You have the right to access, correct, or delete your personal information. 
              Contact us at privacy@filmymela.com for any privacy-related requests.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">6. Updates to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you 
              of any changes by posting the new policy on this page.
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
