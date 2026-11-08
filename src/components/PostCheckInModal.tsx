import React from 'react';
import type { CheckInEntry, ModeType, HouseId } from '../types';
import { HOUSES } from '../data/appleData';
import { useSheetDrag } from '../lib/useSheetDrag';

export interface PostCheckInModalProps {
  isOpen: boolean;
  entry: CheckInEntry | null;
  mode: ModeType;
  houseId: HouseId;
  pointsEarned: number;
  onClose: () => void;
  onOpenRedFlag?: () => void;
}

export const PostCheckInModal: React.FC<PostCheckInModalProps> = ({
  isOpen,
  entry,
  mode,
  houseId,
  pointsEarned,
  onClose,
  onOpenRedFlag,
}) => {
  const { sheetRef, dragHandleProps } = useSheetDrag(onClose);

  if (!isOpen || !entry) return null;

  const isPlayful = mode === 'playful';
  const houseObj = HOUSES.find((h) => h.id === houseId);
  const houseName = houseObj ? houseObj.name : `${houseId} House`;

  const isRedFlag = entry.symptoms.some((s) => ['blood', 'black', 'pain'].includes(s));

  // 1. Analyze Stool Consistency & Transit
  let stoolSummary = {
    title: 'Ideal Digestion Balance',
    emoji: '✨',
    badgeClass: 't-mint',
    description: 'Your stool is in the ideal Bristol zone (Type 3 or 4). Digestion speed and water balance are right on target.',
    action: 'Keep doing what you are doing! Maintain your current meals and fluid routine.',
  };

  if (!entry.pooped) {
    stoolSummary = {
      title: 'No Bowel Movement Logged',
      emoji: '⏸️',
      badgeClass: 't-sun',
      description: 'You did not have a bowel movement today. Skipped days can happen, especially with travel, exams, or low hydration.',
      action: 'Drink extra water and take a walk around campus today to help stimulate gut movement.',
    };
  } else if (entry.bristol && (entry.bristol === 1 || entry.bristol === 2)) {
    stoolSummary = {
      title: 'Slow Transit & Hard Stool',
      emoji: '🧱',
      badgeClass: 't-peach',
      description: 'Your stool was hard or lumpy (Type 1 or 2). This means food moved slowly through your digestive system and lost too much water.',
      action: 'Drink 2 extra glasses of warm water today and add fiber-rich foods like oats, beans, or fresh fruit.',
    };
  } else if (entry.bristol && entry.bristol >= 5) {
    stoolSummary = {
      title: 'Fast Transit & Loose Stool',
      emoji: '🌊',
      badgeClass: 't-lav',
      description: 'Your stool was soft or liquid (Type 5, 6, or 7). Food passed through your gut too fast before enough water could be absorbed.',
      action: 'Eat mild, binding foods such as bananas, rice, applesauce, or toast. Sip water with electrolytes throughout the day.',
    };
  }

  // 2. Hydration Insight & Action
  const hydrationGood = entry.water >= 6;
  const hydrationAdvice = hydrationGood
    ? `Great job drinking ${entry.water} glasses of water today! Proper hydration keeps digestion smooth.`
    : `You logged ${entry.water} glasses of water. Aim for at least 6 to 8 glasses today to keep your stool soft and easy to pass.`;

  // 3. Sleep Insight & Action
  const sleepGood = entry.sleep >= 7;
  const sleepAdvice = sleepGood
    ? `You got ${entry.sleep} hours of sleep last night. Good rest protects healthy gut rhythms.`
    : `You logged ${entry.sleep} hours of sleep. Sleeping under 7 hours can slow down morning gut motility. Plan for an earlier bedtime tonight.`;

  // 4. Fiber / Veggie Insight & Action
  const vegGood = entry.veg >= 3;
  const vegAdvice = vegGood
    ? `You had ${entry.veg} servings of vegetables. Excellent fiber intake to keep your digestive tract moving.`
    : `You logged ${entry.veg} servings of vegetables. Try to grab a bowl of salad, broccoli, or an apple at the dining hall today.`;

  // 5. Stress Insight & Action
  const stressElevated = entry.stress >= 2;
  const stressAdvice = stressElevated
    ? 'Your stress level was marked elevated. The brain and stomach communicate closely; stress can trigger stomach knots or sudden cramps. Take a 5-minute deep-breathing break.'
    : 'Low stress logged today. A relaxed nervous system helps your stomach digest meals comfortably.';

  // Build 3 actionable next steps
  const actionItems: { icon: string; text: string }[] = [];

  if (!hydrationGood) {
    actionItems.push({
      icon: '💧',
      text: 'Drink a tall glass of water right now to help meet your 6–8 glass daily goal.',
    });
  } else {
    actionItems.push({
      icon: '💧',
      text: 'Keep sipping water between classes to maintain your great hydration streak.',
    });
  }

  if (entry.bristol && (entry.bristol === 1 || entry.bristol === 2)) {
    actionItems.push({
      icon: '🍎',
      text: 'Grab an apple, oatmeal, or high-fiber snack at the dining hall to soften stools.',
    });
  } else if (entry.bristol && entry.bristol >= 5) {
    actionItems.push({
      icon: '🍞',
      text: 'Stick to gentle bland foods (toast, rice, soup) and avoid heavy spices today.',
    });
  } else if (!vegGood) {
    actionItems.push({
      icon: '🥗',
      text: 'Add an extra scoop of greens or vegetables to your next meal.',
    });
  } else {
    actionItems.push({
      icon: '🚶',
      text: 'Take a brisk 10-minute walk across campus to support steady digestion.',
    });
  }

  if (!sleepGood) {
    actionItems.push({
      icon: '😴',
      text: 'Wind down 30 minutes early tonight to give your gut enough time to rest and reset.',
    });
  } else if (stressElevated) {
    actionItems.push({
      icon: '🧘',
      text: 'Take 3 slow, deep breaths before your next class to ease stomach tension.',
    });
  } else {
    actionItems.push({
      icon: '⭐',
      text: 'Your habits look great today! Keep your routine steady for tomorrow.',
    });
  }

  return (
    <>
      <div className="apple-scrim on" onClick={onClose} />
      <div
        ref={sheetRef}
        className="apple-sheet on"
        role="dialog"
        aria-modal="true"
        aria-label="Daily Check-in Health Analysis"
      >
        <div className="apple-grab" {...dragHandleProps} />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[var(--line)] mb-4" {...dragHandleProps}>
          <div>
            <h2 className="text-[20px] font-black tracking-tight text-[var(--ink)]">
              {isPlayful ? 'Daily Gut Health Analysis 📊' : 'Daily Health Summary'}
            </h2>
            <p className="text-[12px] font-bold text-[var(--muted)]">
              Personalized tips based on what you logged today
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[var(--card)] shadow-[var(--shadow)] font-black text-[18px] grid place-items-center hover:bg-[var(--bg)] text-[var(--ink)]"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* House Points Celebration Card */}
          <div className="p-3.5 rounded-2xl bg-[var(--card)] border border-[var(--line)] shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-[26px]">
                {isPlayful ? '🏆' : '✓'}
              </span>
              <div>
                <b className="text-[14px] font-black text-[var(--ink)] block leading-tight">
                  Check-in Saved! +{pointsEarned} pts
                </b>
                <span className="text-[11.5px] font-bold text-[var(--muted)]">
                  Counted toward {houseName} House Cup
                </span>
              </div>
            </div>
            <span className="apple-tag t-mint font-black">
              Logged Today ✓
            </span>
          </div>

          {/* Red Flag Warning if present */}
          {isRedFlag && (
            <div className="p-3.5 rounded-2xl bg-[var(--danger-l)] border-2 border-[var(--danger)] text-[var(--danger)] space-y-1.5">
              <div className="flex items-center justify-between">
                <b className="text-[13.5px] font-black flex items-center gap-1.5">
                  <span>🚨</span> Health Alert: Red Flag Logged
                </b>
                {onOpenRedFlag && (
                  <button
                    type="button"
                    className="text-[11px] font-black underline bg-white/50 px-2 py-0.5 rounded-md"
                    onClick={() => {
                      onClose();
                      onOpenRedFlag();
                    }}
                  >
                    View Campus Resources →
                  </button>
                )}
              </div>
              <p className="text-[12px] font-semibold leading-snug">
                You checked a symptom that should be checked by a doctor (such as severe pain or visible blood). Please visit the F&amp;M Student Wellness Center.
              </p>
            </div>
          )}

          {/* Stool Analysis Card */}
          <div className="apple-card p-4 space-y-2 border-2 border-[var(--brand)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[22px]">{stoolSummary.emoji}</span>
                <b className="text-[15px] font-black text-[var(--ink)]">
                  {stoolSummary.title}
                </b>
              </div>
              <span className={`apple-tag ${stoolSummary.badgeClass} font-black`}>
                {entry.pooped && entry.bristol ? `Bristol ${entry.bristol}` : 'Status'}
              </span>
            </div>
            <p className="text-[12.5px] font-semibold text-[var(--ink2)] leading-relaxed">
              {stoolSummary.description}
            </p>
            <div className="p-2.5 bg-[var(--bg)] rounded-xl border border-[var(--line)] text-[12px] font-bold text-[var(--ink)]">
              💡 <b>Guidance:</b> {stoolSummary.action}
            </div>
          </div>

          {/* Habit Insights Breakdown */}
          <div className="space-y-2">
            <h3 className="text-[14px] font-black text-[var(--ink)] flex items-center justify-between">
              <span>Daily Habits Breakdown</span>
              <span className="text-[11px] font-bold text-[var(--muted)]">4 Key Factors</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px]">
              {/* Hydration */}
              <div className="p-3 bg-[var(--card)] rounded-xl border border-[var(--line)] shadow-xs space-y-1">
                <div className="flex items-center justify-between font-black text-[var(--ink)]">
                  <span className="flex items-center gap-1.5">
                    <span>💧</span> Hydration
                  </span>
                  <span className={hydrationGood ? 'text-[var(--mint)]' : 'text-[var(--peach-d)]'}>
                    {entry.water} glasses {hydrationGood ? '✓' : '⚠️'}
                  </span>
                </div>
                <p className="text-[11.5px] font-medium text-[var(--ink2)] leading-snug">
                  {hydrationAdvice}
                </p>
              </div>

              {/* Sleep */}
              <div className="p-3 bg-[var(--card)] rounded-xl border border-[var(--line)] shadow-xs space-y-1">
                <div className="flex items-center justify-between font-black text-[var(--ink)]">
                  <span className="flex items-center gap-1.5">
                    <span>😴</span> Sleep
                  </span>
                  <span className={sleepGood ? 'text-[var(--mint)]' : 'text-[var(--peach-d)]'}>
                    {entry.sleep}h {sleepGood ? '✓' : '⚠️'}
                  </span>
                </div>
                <p className="text-[11.5px] font-medium text-[var(--ink2)] leading-snug">
                  {sleepAdvice}
                </p>
              </div>

              {/* Fiber / Veg */}
              <div className="p-3 bg-[var(--card)] rounded-xl border border-[var(--line)] shadow-xs space-y-1">
                <div className="flex items-center justify-between font-black text-[var(--ink)]">
                  <span className="flex items-center gap-1.5">
                    <span>🥗</span> Fiber &amp; Veg
                  </span>
                  <span className={vegGood ? 'text-[var(--mint)]' : 'text-[var(--muted)]'}>
                    {entry.veg} servings
                  </span>
                </div>
                <p className="text-[11.5px] font-medium text-[var(--ink2)] leading-snug">
                  {vegAdvice}
                </p>
              </div>

              {/* Stress */}
              <div className="p-3 bg-[var(--card)] rounded-xl border border-[var(--line)] shadow-xs space-y-1">
                <div className="flex items-center justify-between font-black text-[var(--ink)]">
                  <span className="flex items-center gap-1.5">
                    <span>🧠</span> Stress
                  </span>
                  <span className={stressElevated ? 'text-[var(--danger)]' : 'text-[var(--mint)]'}>
                    {stressElevated ? 'High ⚠️' : 'Calm ✓'}
                  </span>
                </div>
                <p className="text-[11.5px] font-medium text-[var(--ink2)] leading-snug">
                  {stressAdvice}
                </p>
              </div>
            </div>
          </div>

          {/* Action Checklist */}
          <div className="p-3.5 bg-[var(--bg)] rounded-2xl border border-[var(--line)] space-y-2">
            <b className="text-[13px] font-black text-[var(--ink)] block">
              ✅ Suggested Next Steps for Today:
            </b>
            <div className="space-y-2">
              {actionItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-[var(--card)] rounded-xl border border-[var(--line)] flex items-start gap-2.5 text-[12px] font-semibold text-[var(--ink)]"
                >
                  <span className="text-[15px] flex-none mt-0.5">{item.icon}</span>
                  <span className="leading-snug">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dismiss Action Button */}
          <button
            type="button"
            className="apple-btn text-[16px] py-3 mt-2"
            onClick={onClose}
          >
            Got It! Back to Dashboard →
          </button>
        </div>
      </div>
    </>
  );
};
