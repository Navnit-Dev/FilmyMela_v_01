'use client';

import { useBootScreen } from './boot-screen-provider';

export default function BootScreen() {
  const { showBootScreen } = useBootScreen();

  if (!showBootScreen) return null;

  return (
    <>
      <style jsx>{`
        :root {
          --netflix-red: #E50914;
          --bg-black: #000000;
        }

        .boot-screen-container {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-black);
          overflow: hidden;
          z-index: 9999;
        }

        /* 🔴 TOP GLOW */
        .top-glow {
          position: absolute;
          top: 0;
          width: 100%;
          height: 50%;
          background: radial-gradient(
            ellipse at top,
            rgba(229, 9, 20, 0.15),
            transparent 70%
          );
          z-index: 1;
        }

        /* 🎞 grain */
        .grain {
          position: absolute;
          inset: 0;
          background-image: url("https://grainy-gradients.vercel.app/noise.svg");
          opacity: 0.05;
          z-index: 10;
        }

        /* 🎬 BACKGROUND */
        .boot-bg-overlay {
          position: absolute;
          bottom: 0;
          width: 100%;
          height: 60%;
          background:
            linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0.2)),
            url('/poster.png');
          background-size: cover;
          background-position: center;
          clip-path: ellipse(100% 100% at 50% 100%);
          animation: bg-rise 1.6s ease-out forwards;
          z-index: 2;
        }

        @keyframes bg-rise {
          from { opacity: 0; transform: translateY(80px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* 🔴 BIG F (FIXED COLOR ISSUE) */
        .initial-f {
          position: absolute;
          font-size: 22rem;
          font-weight: 900;
          color: #E50914 !important; /* ✅ FORCE RED */
          -webkit-text-fill-color: #E50914; /* ✅ SAFARI FIX */
          opacity: 0;
          z-index: 3;
          animation: f-reveal 2s cubic-bezier(0.7, 0, 0.3, 1) forwards;
          filter: drop-shadow(0 0 60px rgba(229, 9, 20, 0.9));
          font-family: 'Bebas Neue', sans-serif;
        }

        @keyframes f-reveal {
          0% {
            opacity: 0;
            transform: scale(0.3);
            filter: blur(20px);
          }
          40% {
            opacity: 1;
            transform: scale(1.1);
            filter: blur(0);
          }
          100% {
            opacity: 0;
            transform: scale(5);
            filter: blur(10px);
          }
        }

        /* ✨ LOGO */
        .logo-wrapper {
          position: relative;
          opacity: 0;
          z-index: 5;
          animation: logo-fade 2.6s 1.4s ease forwards;
        }

        @keyframes logo-fade {
          0% { opacity: 0; transform: scale(0.85); }
          30% { opacity: 1; transform: scale(1); }
          80% { opacity: 1; }
          100% { opacity: 0; transform: scale(1.25); }
        }

        .logo-text {
          display: flex;
          font-size: 6.5rem;
          font-weight: 900;
          color: #E50914;
          letter-spacing: -3px;
          text-transform: uppercase;
          text-shadow:
            0 0 10px rgba(229,9,20,0.6),
            0 0 30px rgba(229,9,20,0.4);
        }

        .letter {
          opacity: 0;
          transform: translateY(40px);
          animation: letter-rise 0.6s forwards;
        }

        @keyframes letter-rise {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* 📱 MOBILE FULL BG FIX */
        @media (max-width: 768px) {
          .initial-f { font-size: 12rem; }
          .logo-text { font-size: 3rem; }

          .boot-bg-overlay {
            height: 100%;
            clip-path: none; /* ✅ REMOVE CURVE */
            background:
              linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.4)),
              url('/poster.png');
            background-size: cover;
            background-position: center;
          }
        }
      `}</style>

      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet" />

      <div className="boot-screen-container">
        <div className="top-glow" />
        <div className="grain" />
        <div className="boot-bg-overlay" />

        {/* ❌ removed text-red-600 */}
        <div className="initial-f">F</div>

        <div className="logo-wrapper">
          <div className="logo-text">
            {"FILMYMELA".split('').map((char, index) => (
              <span
                key={index}
                className="letter"
                style={{ animationDelay: `${1.6 + index * 0.07}s` }}
              >
                {char}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}