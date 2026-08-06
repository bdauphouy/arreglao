import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Minus, Plus } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import type { Annonce } from '../api/annonces';
import { applyToAnnonce, hasApplied, listApplicationsForAnnonce } from '../api/applications';
import {
  clampPrice,
  parsePriceInput,
  PRICE_STEP,
  QUICK_PICK_PRICES,
  suggestedApplicationPrice,
} from '../lib/pricing';
import { Badge } from './badge';
import { Button } from './button';
import { Pill } from './pill';
import { TextArea } from './text-area';

type ApplyFormProps = {
  annonce: Annonce;
  applicantId: string;
  onApplied?: () => void;
};

export function ApplyForm({ annonce, applicantId, onApplied }: ApplyFormProps) {
  const queryClient = useQueryClient();
  const suggestedPrice = suggestedApplicationPrice(annonce.budgetMin, annonce.budgetMax);
  const [price, setPrice] = useState(suggestedPrice);
  const [message, setMessage] = useState('');

  const adjustPrice = (delta: number) => {
    setPrice((current) => clampPrice(current + delta));
  };

  const hasAppliedQuery = useQuery({
    queryKey: ['application', 'mine', annonce.id, applicantId],
    queryFn: () => hasApplied(annonce.id, applicantId),
  });

  const applicationsQuery = useQuery({
    queryKey: ['applications', annonce.id],
    queryFn: () => listApplicationsForAnnonce(annonce.id),
    enabled: hasAppliedQuery.data === false,
  });

  const otherPrices = [...(applicationsQuery.data ?? [])]
    .map((application) => application.proposedPrice)
    .sort((a, b) => a - b);

  const applyMutation = useMutation({
    mutationFn: () => applyToAnnonce(annonce.id, applicantId, message.trim(), price),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', 'mine', annonce.id] });
      queryClient.invalidateQueries({ queryKey: ['applications', 'mine', applicantId] });
      queryClient.invalidateQueries({ queryKey: ['applications', annonce.id] });
      queryClient.invalidateQueries({ queryKey: ['annonce', annonce.id] });
      queryClient.invalidateQueries({ queryKey: ['annonces'] });
      setPrice(suggestedPrice);
      setMessage('');
      onApplied?.();
    },
  });

  if (hasAppliedQuery.data) {
    return <Badge tone="success">Ya aplicaste</Badge>;
  }

  const canSubmit = price >= 0;

  return (
    <View className="gap-3">
      {otherPrices.length > 0 ? (
        <View className="gap-1.5">
          <Text className="font-sans-semibold text-sm text-olive-700">
            Ofertas de otros aplicantes
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {otherPrices.map((otherPrice, index) => (
              <Badge key={index} tone="neutral">
                L {otherPrice}
              </Badge>
            ))}
          </View>
        </View>
      ) : null}

      <View className="gap-2">
        <Text className="font-sans-semibold text-sm text-olive-700">Tu precio</Text>
        <View className="flex-row items-center self-start gap-1 rounded-full border border-olive-200 bg-white py-1 pl-1 pr-3">
          <Pressable
            onPress={() => adjustPrice(-PRICE_STEP)}
            className="h-10 w-10 items-center justify-center rounded-full active:bg-olive-50"
          >
            <Minus size={18} color="#14170F" />
          </Pressable>
          <View className="flex-row items-center">
            <Text className="font-sans-extrabold text-2xl leading-tight text-ink-900">L </Text>
            <TextInput
              value={String(price)}
              onChangeText={(text) => setPrice(parsePriceInput(text))}
              keyboardType="numeric"
              className="min-w-16 p-0 font-sans-extrabold text-2xl leading-tight text-ink-900"
              style={{ includeFontPadding: false, textAlignVertical: 'center' }}
            />
          </View>
          <Pressable
            onPress={() => adjustPrice(PRICE_STEP)}
            className="h-10 w-10 items-center justify-center rounded-full active:bg-olive-50"
          >
            <Plus size={18} color="#14170F" />
          </Pressable>
        </View>
        <View className="flex-row flex-wrap gap-2">
          {QUICK_PICK_PRICES.map((amount) => (
            <Pill key={amount} selected={price === amount} onPress={() => setPrice(amount)}>
              L {amount}
            </Pill>
          ))}
        </View>
      </View>

      <View className="gap-2">
        <Text className="font-sans-semibold text-sm text-olive-700">Comentario (opcional)</Text>
        <TextArea
          placeholder="Cuéntale al anfitrión por qué eres una buena opción"
          value={message}
          onChangeText={setMessage}
        />
      </View>

      {applyMutation.isError ? (
        <Text className="font-sans text-sm text-danger">
          No se pudo enviar tu aplicación. Inténtalo de nuevo.
        </Text>
      ) : null}

      <Button
        onPress={() => applyMutation.mutate()}
        disabled={applyMutation.isPending || !canSubmit}
      >
        {applyMutation.isPending ? 'Enviando…' : 'Enviar aplicación'}
      </Button>
    </View>
  );
}
