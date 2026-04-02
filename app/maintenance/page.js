import Image from 'next/image';

export const metadata = {
  title: 'Under Maintenance | FilmyMela',
  description: 'We are currently undergoing maintenance. Please check back soon.',
};

export default function MaintenancePage({ searchParams }) {
  const message = searchParams?.message || 'We are currently undergoing maintenance.';

  return (
    <div className="min-h-screen bg-[var(--surface)] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* Logo */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl overflow-hidden bg-[var(--primary)]/10 flex items-center justify-center">
          <Image
            src="https://drive.google.com/u/0/drive-viewer/AKGpihap-6l1VQyUWmzW-JcAxdl-YiY-TxL-JxGGD_xE9A1IYHcP4_BcPeHsu8OVqUZpulNl60C0pS4saHAJiE8kw1JbB2qCQMRjlis=s2560?auditContext=forDisplay"
            alt="FilmyMela"
            width={80}
            height={80}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Title */}
        <h1 className="font-display font-bold text-3xl mb-4 text-white">
          Under Maintenance
        </h1>

        {/* Message */}
        <p className="text-[var(--on-surface-variant)] text-lg mb-8 leading-relaxed">
          {message}
        </p>

        {/* Subtext */}
        <div className="p-4 rounded-xl bg-[var(--surface-container)] ghost-border">
          <p className="text-sm text-[var(--on-surface-variant)]">
            We apologize for the inconvenience. Please check back later.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-sm text-[var(--on-surface-variant)]">
          <p>© {new Date().getFullYear()} FilmyMela. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
