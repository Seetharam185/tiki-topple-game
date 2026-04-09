import React from 'react';

const CARD_INFO = {
  tikiUp: {
    1: { icon: '🔺', name: 'Tiki Up +1', desc: 'Move a tiki up 1 position', hint: 'Use to improve position slightly' },
    2: { icon: '🔺🔺', name: 'Tiki Up +2', desc: 'Move a tiki up 2 positions', hint: 'Good for a quick boost' },
    3: { icon: '🔺🔺🔺', name: 'Tiki Up +3', desc: 'Move a tiki up 3 positions', hint: 'Powerful upward push' },
  },
  tikiToast: {
    null: { icon: '🍞', name: 'Tiki Toast', desc: 'Remove the bottom tiki', hint: 'Cannot use as first move' },
  },
  tikiTopple: {
    null: { icon: '💥', name: 'Tiki Topple', desc: 'Send a tiki to the bottom', hint: 'Use to sabotage leaders' },
  },
};

export default function CardComponent({ card, selected, disabled, onClick }) {
  const info =
    CARD_INFO[card.type]?.[card.amount] ||
    CARD_INFO[card.type]?.['null'] ||
    CARD_INFO[card.type]?.[null] ||
    { icon: '❓', name: card.type, desc: '', hint: '' };

  const isUsed = card.used;
  const isDisabled = disabled || isUsed;

  return (
    <div
      onClick={!isDisabled ? onClick : undefined}
      className={`
        relative rounded-2xl shadow-md p-3 flex flex-col items-center gap-1 min-w-[90px] max-w-[110px] border-2 transition-all duration-150 select-none
        ${isUsed ? 'opacity-40 cursor-not-allowed bg-gray-100 border-gray-200' : ''}
        ${!isUsed && isDisabled ? 'opacity-60 cursor-not-allowed bg-white border-gray-200' : ''}
        ${!isDisabled && !selected ? 'bg-white border-orange-200 cursor-pointer hover:border-orange-400 hover:shadow-lg hover:-translate-y-1' : ''}
        ${selected ? 'bg-blue-50 border-blue-500 cursor-pointer shadow-lg -translate-y-1 ring-2 ring-blue-300' : ''}
      `}
    >
      {isUsed && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/60 z-10">
          <span className="text-gray-400 font-bold text-xs rotate-[-30deg]">USED</span>
        </div>
      )}
      <span className="text-2xl">{info.icon}</span>
      <span className="font-bold text-xs text-center text-gray-800 leading-tight">{info.name}</span>
      <span className="text-xs text-center text-gray-500 leading-tight">{info.desc}</span>
      <span className="text-xs text-center text-gray-400 italic leading-tight">{info.hint}</span>
    </div>
  );
}
