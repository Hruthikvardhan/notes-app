import React from 'react';
import { NOTE_COLORS } from '../../utils/constants';
import { IoCheckmark } from 'react-icons/io5';

const ColorPicker = ({ value, onChange }) => (
  <div className="flex flex-wrap gap-2 p-2">
    {NOTE_COLORS.map((c) => (
      <button
        key={c.value}
        type="button"
        title={c.name}
        onClick={() => onChange(c.value)}
        className="w-7 h-7 rounded-full border border-ink/10 dark:border-white/10 flex items-center justify-center"
        style={{ backgroundColor: c.value }}
      >
        {value === c.value && <IoCheckmark className="text-ink/70 dark:text-gray-300" size={16} />}
      </button>
    ))}
  </div>
);

export default ColorPicker;
