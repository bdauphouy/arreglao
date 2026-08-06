import { useState } from 'react';
import { View } from 'react-native';

import { JOB_CATEGORIES, JOB_CATEGORY_LABELS } from '../lib/job-categories';
import { Pill } from './pill';
import { TextField } from './text-field';

type CategoryPickerProps = {
  value: string | null;
  onChange: (value: string) => void;
};

const SUGGESTED_CATEGORIES: readonly string[] = JOB_CATEGORIES;

export function CategoryPicker({ value, onChange }: CategoryPickerProps) {
  const isSuggested = value !== null && SUGGESTED_CATEGORIES.includes(value);
  const [customMode, setCustomMode] = useState(value !== null && !isSuggested);

  return (
    <View className="gap-3">
      <View className="flex-row flex-wrap gap-2">
        {JOB_CATEGORIES.map((category) => (
          <Pill
            key={category}
            selected={!customMode && value === category}
            onPress={() => {
              setCustomMode(false);
              onChange(category);
            }}
          >
            {JOB_CATEGORY_LABELS[category]}
          </Pill>
        ))}
        <Pill selected={customMode} onPress={() => setCustomMode(true)}>
          + Otra
        </Pill>
      </View>
      {customMode ? (
        <TextField
          placeholder="Escribe tu categoría"
          value={isSuggested ? '' : (value ?? '')}
          onChangeText={onChange}
          maxLength={40}
          autoFocus
        />
      ) : null}
    </View>
  );
}
