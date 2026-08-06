import { Text, View } from 'react-native';

import { Pill } from './pill';
import { TextField } from './text-field';

type BudgetRangeInputProps = {
  value: [number, number];
  onChange: (value: [number, number]) => void;
};

const QUICK_RANGES: [number, number][] = [
  [100, 300],
  [300, 600],
  [600, 1000],
  [1000, 2000],
];

function parseAmount(text: string): number {
  const digitsOnly = text.replace(/[^0-9]/g, '');
  return digitsOnly === '' ? 0 : Number(digitsOnly);
}

export function BudgetRangeInput({ value, onChange }: BudgetRangeInputProps) {
  const [min, max] = value;

  return (
    <View className="gap-3">
      <View className="flex-row gap-3">
        <View className="flex-1 gap-1.5">
          <Text className="font-sans-medium text-xs text-olive-600">Mínimo</Text>
          <TextField
            keyboardType="number-pad"
            placeholder="L 0"
            value={min > 0 ? String(min) : ''}
            onChangeText={(text) => onChange([parseAmount(text), max])}
          />
        </View>
        <View className="flex-1 gap-1.5">
          <Text className="font-sans-medium text-xs text-olive-600">Máximo</Text>
          <TextField
            keyboardType="number-pad"
            placeholder="L 0"
            value={max > 0 ? String(max) : ''}
            onChangeText={(text) => onChange([min, parseAmount(text)])}
          />
        </View>
      </View>
      <View className="flex-row flex-wrap gap-2">
        {QUICK_RANGES.map(([rangeMin, rangeMax]) => (
          <Pill
            key={`${rangeMin}-${rangeMax}`}
            selected={min === rangeMin && max === rangeMax}
            onPress={() => onChange([rangeMin, rangeMax])}
          >
            L {rangeMin}–{rangeMax}
          </Pill>
        ))}
      </View>
    </View>
  );
}
