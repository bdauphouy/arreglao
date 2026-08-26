import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Text, View } from 'react-native';

import type { Annonce } from '../api/annonces';
import { applyToAnnonce, hasApplied, listApplicationsForAnnonce } from '../api/applications';
import { isWithdrawn } from '../lib/application-status';
import { suggestedApplicationPrice } from '../lib/pricing';
import { Badge } from './badge';
import { Button } from './button';
import { PriceStepper } from './price-stepper';
import { TextArea } from './text-area';

type ApplyFormProps = {
  annonce: Annonce;
  applicantId: string;
  onApplied?: () => void;
};

export function ApplyForm({ annonce, applicantId, onApplied }: ApplyFormProps) {
  const queryClient = useQueryClient();
  const suggestedPrice = suggestedApplicationPrice(annonce.budget);
  const [price, setPrice] = useState(suggestedPrice);
  const [message, setMessage] = useState('');

  const hasAppliedQuery = useQuery({
    queryKey: ['application', 'mine', annonce.id, applicantId],
    queryFn: () => hasApplied(annonce.id, applicantId),
  });

  const applicationsQuery = useQuery({
    queryKey: ['applications', annonce.id],
    queryFn: () => listApplicationsForAnnonce(annonce.id),
    enabled: hasAppliedQuery.data === false,
  });

  const otherPrices = (applicationsQuery.data ?? [])
    .filter((application) => !isWithdrawn(application.status))
    .map((application) => application.proposedPrice)
    .sort((a, b) => a - b);

  const applyMutation = useMutation({
    mutationFn: () => applyToAnnonce(annonce.id, applicantId, message.trim(), price),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
        <PriceStepper value={price} onChange={setPrice} />
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
