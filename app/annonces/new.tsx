import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { createAnnonce } from '../../src/api/annonces';
import { getCurrentUserId } from '../../src/api/auth';
import { Button } from '../../src/components/button';
import { CategoryPicker } from '../../src/components/category-picker';
import { PriceStepper } from '../../src/components/price-stepper';
import { TextArea } from '../../src/components/text-area';
import { TextField } from '../../src/components/text-field';
import { useCurrentProfile } from '../../src/hooks/use-current-profile';
import { FALLBACK_PRICE } from '../../src/lib/pricing';
import { annonceCreateSchema } from '../../src/schemas/annonce';
import type { JobCategory } from '../../src/schemas/job-category';

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }
  return <Text className="font-sans text-sm text-danger">{message}</Text>;
}

export default function NewAnnonceScreen() {
  const meQuery = useCurrentProfile();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<JobCategory | null>(null);
  const [budget, setBudget] = useState(FALLBACK_PRICE);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const location = meQuery.data?.location ?? null;

  const createMutation = useMutation({
    mutationFn: async () => {
      const result = annonceCreateSchema.safeParse({
        title,
        description,
        category,
        budget,
      });
      if (!result.success) {
        const errors: Record<string, string> = {};
        for (const issue of result.error.issues) {
          const key = issue.path[0];
          if (typeof key === 'string' && !(key in errors)) {
            errors[key] = issue.message;
          }
        }
        setFieldErrors(errors);
        throw new Error('Revisa los campos marcados.');
      }
      setFieldErrors({});

      if (!location) {
        throw new Error('Agrega tu dirección en tu perfil antes de publicar.');
      }

      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('No authenticated user');
      }
      return createAnnonce(userId, result.data, location);
    },
    onSuccess: (annonce) => {
      router.replace(`/annonces/${annonce.id}`);
    },
  });

  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top', 'left', 'right']}>
      <View className="flex-row items-center gap-3 px-6 pb-2 pt-2">
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="h-8 w-8 items-center justify-center"
        >
          <ArrowLeft size={22} strokeWidth={1.75} color="#14170F" />
        </Pressable>
        <Text className="font-sans-extrabold text-2xl text-ink-900">Publicar anuncio</Text>
      </View>

      <ScrollView contentContainerClassName="gap-6 px-6 pb-10 pt-4">
        {!meQuery.isLoading && !location ? (
          <View className="gap-2 rounded-md border border-olive-200 bg-white p-4">
            <Text className="font-sans-semibold text-sm text-ink-900">
              Agrega tu dirección para poder publicar
            </Text>
            <Text className="font-sans text-sm text-olive-600">
              Tus anuncios usan la dirección de tu perfil. Agrégala primero.
            </Text>
            <Button variant="outline" onPress={() => router.push('/account')}>
              Ir a mi perfil
            </Button>
          </View>
        ) : null}

        <View className="gap-3">
          <Text className="font-sans-semibold text-sm text-olive-700">Título</Text>
          <TextField placeholder="¿Qué necesitas?" value={title} onChangeText={setTitle} />
          <FieldError message={fieldErrors.title} />
        </View>

        <View className="gap-3">
          <Text className="font-sans-semibold text-sm text-olive-700">Descripción</Text>
          <TextArea
            placeholder="Cuenta los detalles del trabajo"
            value={description}
            onChangeText={setDescription}
          />
          <FieldError message={fieldErrors.description} />
        </View>

        <View className="gap-3">
          <Text className="font-sans-semibold text-sm text-olive-700">Categoría</Text>
          <CategoryPicker value={category} onChange={setCategory} />
          <FieldError message={fieldErrors.category} />
        </View>

        <View className="gap-3">
          <Text className="font-sans-semibold text-sm text-olive-700">Presupuesto (Lempiras)</Text>
          <PriceStepper value={budget} onChange={setBudget} />
          <FieldError message={fieldErrors.budget} />
        </View>

        {createMutation.isError ? (
          <Text className="font-sans text-sm text-danger">
            {createMutation.error instanceof Error
              ? createMutation.error.message
              : 'No se pudo publicar el anuncio. Inténtalo de nuevo.'}
          </Text>
        ) : null}

        <View className="gap-3">
          <Button
            size="lg"
            onPress={() => createMutation.mutate()}
            disabled={createMutation.isPending || !location}
          >
            {createMutation.isPending ? 'Publicando…' : 'Publicar'}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onPress={() => router.back()}
            disabled={createMutation.isPending}
          >
            Cancelar
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
