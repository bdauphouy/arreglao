import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { Dimensions, Text, View } from 'react-native';

type BudgetRangeSliderProps = {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
};

// The library needs an explicit pixel width — matches the screen's px-6
// (24px) horizontal padding on each side, minus a little breathing room so
// the end markers don't clip the container edge.
const SLIDER_LENGTH = Dimensions.get('window').width - 24 * 2 - 16;

export function BudgetRangeSlider({ min, max, step = 50, value, onChange }: BudgetRangeSliderProps) {
  return (
    <View className="items-center gap-2">
      <Text className="font-sans-bold text-base text-ink-900">
        L {value[0]} - L {value[1]}
      </Text>
      <MultiSlider
        values={value}
        min={min}
        max={max}
        step={step}
        sliderLength={SLIDER_LENGTH}
        onValuesChange={(values) => onChange([values[0], values[1]])}
        selectedStyle={{ backgroundColor: '#D6F24C' }}
        unselectedStyle={{ backgroundColor: '#D8D5C0' }}
        trackStyle={{ height: 4, borderRadius: 2 }}
        markerStyle={{
          height: 24,
          width: 24,
          borderRadius: 12,
          backgroundColor: '#14170F',
          borderWidth: 0,
        }}
        pressedMarkerStyle={{ height: 26, width: 26, borderRadius: 13 }}
      />
    </View>
  );
}
