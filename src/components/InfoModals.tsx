import React from 'react';
import { useSheetDrag } from '../lib/useSheetDrag';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function useEscapeKey(isOpen: boolean, onClose: () => void) {
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
}

interface RedFlagModalProps extends InfoModalProps {
  onDismissWarning?: () => void;
}

export const RedFlagModal: React.FC<RedFlagModalProps> = ({ isOpen, onClose, onDismissWarning }) => {
  const { sheetRef, dragHandleProps } = useSheetDrag(onClose);
  useEscapeKey(isOpen, onClose);
  if (!isOpen) return null;

  return (
    <>
      <div className="apple-scrim on" onClick={onClose} />
      <div ref={sheetRef} className="apple-sheet on" role="dialog" aria-modal="true">
        <div className="apple-grab" {...dragHandleProps} />
        <div className="flex items-center justify-between pb-2 mb-2 sticky top-[-10px] bg-[var(--bg)] z-10 pt-2" {...dragHandleProps}>
          <h2 className="text-[21px] font-black tracking-tight text-[var(--danger)]">
            ❗ Please get this checked
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[var(--card)] shadow-[var(--shadow)] font-black text-[18px] grid place-items-center hover:bg-[var(--card)]"
          >
            ×
          </button>
        </div>

        <p className="text-[14px] text-[var(--ink2)] font-semibold leading-relaxed mb-3">
          Blood, black stool, or bad stomach pain can have many causes. Most are easy to treat, but they should be checked promptly by a doctor or nurse, not a phone app.
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
              <a
                href="tel:7175449051"
                className="text-[12.5px] text-[var(--mint-d)] font-bold inline-flex items-center gap-1 hover:underline"
              >
                📞 Call (717) 544-9051 (Goerz Hall) →
              </a>
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
              <a
                href="tel:7172913911"
                className="text-[12.5px] text-[var(--danger)] font-bold inline-flex items-center gap-1 hover:underline"
              >
                🚨 Call F&amp;M Public Safety: (717) 291-3911 or 911 →
              </a>
            </div>
          </div>
        </div>

        <p className="text-[11.5px] text-[var(--muted)] font-bold mb-4">
          This health reminder is based on American Gastroenterological Association guidelines.
        </p>

        <div className="space-y-2">
          <button
            type="button"
            className="apple-btn"
            onClick={() => {
              if (onDismissWarning) onDismissWarning();
              onClose();
            }}
          >
            I Understand &amp; Dismiss Warning
          </button>
          <button
            type="button"
            className="apple-btn ghost text-[13.5px] py-2.5"
            onClick={onClose}
          >
            Keep Warning Active
          </button>
        </div>
      </div>
    </>
  );
};

export const AIInfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  const { sheetRef, dragHandleProps } = useSheetDrag(onClose);
  useEscapeKey(isOpen, onClose);
  if (!isOpen) return null;

  return (
    <>
      <div className="apple-scrim on" onClick={onClose} />
      <div ref={sheetRef} className="apple-sheet on" role="dialog" aria-modal="true">
        <div className="apple-grab" {...dragHandleProps} />
        <div className="flex items-center justify-between pb-2 mb-2 sticky top-[-10px] bg-[var(--bg)] z-10 pt-2" {...dragHandleProps}>
          <h2 className="text-[21px] font-black tracking-tight text-[var(--ink)]">
            ✨ How the AI works
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[var(--card)] shadow-[var(--shadow)] font-black text-[18px] grid place-items-center hover:bg-[var(--card)]"
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
                Connects your sleep, water, fiber, and school stress with how easily you poop.
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
                Summarizes your week just like a helpful health coach.
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
                Only recommends simple, proven everyday habits.
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
                It may suggest seeing a nurse or doctor, but never gives medical diagnoses.
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
                Built for 100% privacy with zero tracking.
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
                All data stays safely on your own phone or computer.
              </p>
            </div>
          </div>
        </div>

        <div className="apple-banner text-[13px] leading-snug">
          <span>ℹ️</span>
          <div>
            <b>How it works:</b> Pattern detection runs right on your device using simple stats and benchmarks. Zero third-party analytics.
          </div>
        </div>
      </div>
    </>
  );
};

export const ScienceModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  const { sheetRef, dragHandleProps } = useSheetDrag(onClose);
  useEscapeKey(isOpen, onClose);
  if (!isOpen) return null;

  return (
    <>
      <div className="apple-scrim on" onClick={onClose} />
      <div ref={sheetRef} className="apple-sheet on" role="dialog" aria-modal="true">
        <div className="apple-grab" {...dragHandleProps} />
        <div className="flex items-center justify-between pb-2 mb-2 sticky top-[-10px] bg-[var(--bg)] z-10 pt-2" {...dragHandleProps}>
          <h2 className="text-[21px] font-black tracking-tight text-[var(--ink)]">
            📚 The science behind it
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[var(--card)] shadow-[var(--shadow)] font-black text-[18px] grid place-items-center hover:bg-[var(--card)]"
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
                Groups bowel movements into 7 simple types (Bristol Scale, 1997). Used worldwide by doctors.
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
                Any frequency from 3 times a day to 3 times a week is completely normal for healthy adults.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-[12px] bg-[var(--lav-l)] grid place-items-center text-[18px] flex-none">
              😴
            </div>
            <div>
              <b className="text-[14px] font-black text-[var(--ink)] block">
                Sleep &amp; Body Clock
              </b>
              <p className="text-[12.5px] text-[var(--ink2)] font-semibold">
                Young adults need 7+ hours of good sleep. Poor sleep disrupts digestion and can cause an upset stomach.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-[12px] bg-[var(--mint-l)] grid place-items-center text-[18px] flex-none">
              🥗
            </div>
            <div>
              <b className="text-[14px] font-black text-[var(--ink)] block">
                Dietary Fiber
              </b>
              <p className="text-[12.5px] text-[var(--ink2)] font-semibold">
                Target is ~25 g/day for women and ~38 g/day for men. Most college students get less than half of that.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-[12px] bg-[var(--peach-l)] grid place-items-center text-[18px] flex-none">
              🧠
            </div>
            <div>
              <b className="text-[14px] font-black text-[var(--ink)] block">
                The Gut-Brain Axis
              </b>
              <p className="text-[12.5px] text-[var(--ink2)] font-semibold">
                School and exam stress triggers hormones that can suddenly speed up or slow down your gut.
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
