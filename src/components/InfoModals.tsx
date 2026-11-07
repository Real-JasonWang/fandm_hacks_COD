import React from 'react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RedFlagModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="apple-scrim on" onClick={onClose} />
      <div className="apple-sheet on" role="dialog" aria-modal="true">
        <div className="apple-grab" />
        <div className="flex items-center justify-between pb-2 mb-2 sticky top-[-10px] bg-[var(--bg)] z-10 pt-2">
          <h2 className="text-[21px] font-black tracking-tight text-[var(--danger)]">
            ❗ Please get this checked
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[var(--card)] shadow-[var(--shadow)] font-black text-[18px] grid place-items-center hover:bg-[#FFFDF9]"
          >
            ×
          </button>
        </div>

        <p className="text-[14px] text-[var(--ink2)] font-semibold leading-relaxed mb-3">
          Blood in your stool, black or tarry stool, or acute severe abdominal pain can stem from various causes — most are treatable, but they should be promptly evaluated by a licensed clinician, not a smartphone app.
        </p>

        <div className="apple-card space-y-3 mb-3">
          <h3 className="font-black text-[15px]">Recommended steps</h3>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[13px] bg-[var(--mint-l)] grid place-items-center text-[19px] flex-none">
              🏥
            </div>
            <div>
              <b className="text-[14px] font-black text-[var(--ink)] block">
                Contact F&amp;M Student Health Services
              </b>
              <p className="text-[12px] text-[var(--ink2)] font-semibold">
                Schedule an appointment or drop in during clinical center hours.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[13px] bg-[var(--danger-l)] grid place-items-center text-[19px] flex-none">
              🚑
            </div>
            <div>
              <b className="text-[14px] font-black text-[var(--danger)] block">
                Heavy bleeding, fainting, or severe pain?
              </b>
              <p className="text-[12px] text-[var(--ink2)] font-semibold">
                Contact F&amp;M Public Safety or dial 911 immediately.
              </p>
            </div>
          </div>
        </div>

        <p className="text-[11.5px] text-[var(--muted)] font-bold mb-4">
          This advisory is a clinical safeguard protocol based on AGA guidelines.
        </p>

        <button className="apple-btn" onClick={onClose}>
          Understood
        </button>
      </div>
    </>
  );
};

export const AIInfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="apple-scrim on" onClick={onClose} />
      <div className="apple-sheet on" role="dialog" aria-modal="true">
        <div className="apple-grab" />
        <div className="flex items-center justify-between pb-2 mb-2 sticky top-[-10px] bg-[var(--bg)] z-10 pt-2">
          <h2 className="text-[21px] font-black tracking-tight text-[var(--ink)]">
            ✨ How the AI works
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[var(--card)] shadow-[var(--shadow)] font-black text-[18px] grid place-items-center hover:bg-[#FFFDF9]"
          >
            ×
          </button>
        </div>

        <div className="apple-card space-y-3 mb-3">
          <h3 className="font-black text-[15px]">What it does</h3>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[12px] bg-[var(--lav-l)] grid place-items-center text-[18px] flex-none">
              📈
            </div>
            <div>
              <b className="text-[13.5px] font-extrabold text-[var(--ink)] block">
                Finds patterns in <i>your</i> personal data
              </b>
              <p className="text-[12px] text-[var(--ink2)] font-semibold">
                Correlates sleep duration, hydration, fiber, and academic stress with stool consistency.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[12px] bg-[var(--lav-l)] grid place-items-center text-[18px] flex-none">
              📝
            </div>
            <div>
              <b className="text-[13.5px] font-extrabold text-[var(--ink)] block">
                Generates a plain-English weekly digest
              </b>
              <p className="text-[12px] text-[var(--ink2)] font-semibold">
                Synthesizes biological signals like an encouraging health coach.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[12px] bg-[var(--lav-l)] grid place-items-center text-[18px] flex-none">
              🎯
            </div>
            <div>
              <b className="text-[13.5px] font-extrabold text-[var(--ink)] block">
                Suggests actionable micro-habits
              </b>
              <p className="text-[12px] text-[var(--ink2)] font-semibold">
                Only recommends validated gastrointestinal health practices.
              </p>
            </div>
          </div>
        </div>

        <div className="apple-card space-y-3 mb-4">
          <h3 className="font-black text-[15px]">What it never does</h3>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[12px] bg-[var(--danger-l)] grid place-items-center text-[18px] flex-none">
              🩺
            </div>
            <div>
              <b className="text-[13.5px] font-extrabold text-[var(--ink)] block">
                Diagnose medical conditions
              </b>
              <p className="text-[12px] text-[var(--ink2)] font-semibold">
                It can advise consulting Health Services, but never diagnoses pathology.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[12px] bg-[var(--danger-l)] grid place-items-center text-[18px] flex-none">
              📷
            </div>
            <div>
              <b className="text-[13.5px] font-extrabold text-[var(--ink)] block">
                Store or transmit stool photos
              </b>
              <p className="text-[12px] text-[var(--ink2)] font-semibold">
                Privacy-first architecture with zero invasive surveillance.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[12px] bg-[var(--danger-l)] grid place-items-center text-[18px] flex-none">
              📤
            </div>
            <div>
              <b className="text-[13.5px] font-extrabold text-[var(--ink)] block">
                Send personal health logs to any server
              </b>
              <p className="text-[12px] text-[var(--ink2)] font-semibold">
                All data is preserved strictly within your local browser storage.
              </p>
            </div>
          </div>
        </div>

        <div className="apple-banner text-[13px] leading-snug">
          <span>ℹ️</span>
          <div>
            <b>Engine Architecture:</b> Pattern detection runs locally using deterministic statistics and calibrated clinical thresholds. Zero third-party analytics.
          </div>
        </div>
      </div>
    </>
  );
};

export const ScienceModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="apple-scrim on" onClick={onClose} />
      <div className="apple-sheet on" role="dialog" aria-modal="true">
        <div className="apple-grab" />
        <div className="flex items-center justify-between pb-2 mb-2 sticky top-[-10px] bg-[var(--bg)] z-10 pt-2">
          <h2 className="text-[21px] font-black tracking-tight text-[var(--ink)]">
            📚 The clinical science
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[var(--card)] shadow-[var(--shadow)] font-black text-[18px] grid place-items-center hover:bg-[#FFFDF9]"
          >
            ×
          </button>
        </div>

        <div className="apple-card space-y-3.5 mb-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-[12px] bg-[#F3E9DC] grid place-items-center text-[18px] flex-none">
              💩
            </div>
            <div>
              <b className="text-[14px] font-black text-[var(--ink)] block">
                Bristol Stool Form Scale (BSFS)
              </b>
              <p className="text-[12.5px] text-[var(--ink2)] font-semibold">
                Classifies bowel movements into 7 distinct types (Lewis &amp; Heaton, <i>Scand. J. Gastroenterology</i>, 1997). Gold standard utilized worldwide by gastroenterologists.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-[12px] bg-[#F3E9DC] grid place-items-center text-[18px] flex-none">
              📆
            </div>
            <div>
              <b className="text-[14px] font-black text-[var(--ink)] block">
                Normal Bowel Frequency
              </b>
              <p className="text-[12.5px] text-[var(--ink2)] font-semibold">
                Any frequency ranging from 3 times a day to 3 times a week is clinically standard for healthy adults.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-[12px] bg-[var(--lav-l)] grid place-items-center text-[18px] flex-none">
              😴
            </div>
            <div>
              <b className="text-[14px] font-black text-[var(--ink)] block">
                Sleep &amp; Circadian Motility
              </b>
              <p className="text-[12.5px] text-[var(--ink2)] font-semibold">
                Adults require 7+ hours of consolidated sleep. Disrupted circadian rhythms trigger visceral hypersensitivity and colonic dysmotility.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-[12px] bg-[var(--mint-l)] grid place-items-center text-[18px] flex-none">
              🥗
            </div>
            <div>
              <b className="text-[14px] font-black text-[var(--ink)] block">
                Dietary Soluble &amp; Insoluble Fiber
              </b>
              <p className="text-[12.5px] text-[var(--ink2)] font-semibold">
                Target intake is ~25 g/day for women and ~38 g/day for men. Most college students average less than 12 g daily.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-[12px] bg-[var(--peach-l)] grid place-items-center text-[18px] flex-none">
              🧠
            </div>
            <div>
              <b className="text-[14px] font-black text-[var(--ink)] block">
                The Gut–Brain Axis
              </b>
              <p className="text-[12.5px] text-[var(--ink2)] font-semibold">
                Psychological stress stimulates autonomic corticotropin-releasing factor (CRF), accelerating or stalling intestinal transit.
              </p>
            </div>
          </div>
        </div>

        <p className="text-[11.5px] text-[var(--muted)] font-bold mb-4">
          Call of Doodie is an educational wellness tool and does not provide medical diagnosis or treatment.
        </p>

        <button className="apple-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </>
  );
};
