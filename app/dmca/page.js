export const metadata = {
  title: 'DMCA Notice',
  description: 'DMCA Notice and Takedown Policy for FilmyMela.',
};

export const dynamic = 'force-static';

export default function DMCAPage() {
  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-red-600">DMCA Notice & Takedown Policy</h1>
        
        <div className="space-y-6 text-gray-300">
          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">1. Introduction</h2>
            <p>
              FilmyMela respects the intellectual property rights of others and expects its users to do the same. 
              In accordance with the Digital Millennium Copyright Act (DMCA), we will respond promptly to claims 
              of copyright infringement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">2. Reporting Copyright Infringement</h2>
            <p>
              If you believe that your copyrighted work has been copied in a way that constitutes copyright infringement, 
              please provide us with a written notice containing the following information:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Physical or electronic signature of the copyright owner or authorized agent</li>
              <li>Identification of the copyrighted work claimed to be infringed</li>
              <li>Identification of the infringing material and its location on our site</li>
              <li>Your contact information (address, phone, email)</li>
              <li>Statement of good faith belief that the use is not authorized</li>
              <li>Statement that the information is accurate, under penalty of perjury</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">3. Contact Information</h2>
            <p>
              DMCA notices should be sent to our designated agent at:
            </p>
            <p className="mt-2">
              <strong>Email:</strong> dmca@filmymela.com<br />
              <strong>Address:</strong> FilmyMela DMCA Agent, India
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">4. Counter-Notification</h2>
            <p>
              If you believe your content was removed in error, you may submit a counter-notification containing:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Your physical or electronic signature</li>
              <li>Identification of the removed content and its location</li>
              <li>Statement under penalty of perjury of good faith belief</li>
              <li>Your contact information and consent to jurisdiction</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">5. Repeat Infringers</h2>
            <p>
              FilmyMela reserves the right to terminate accounts of users who are found to be repeat infringers 
              of copyright.
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
