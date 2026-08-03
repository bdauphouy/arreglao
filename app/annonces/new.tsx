import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { createAnnonce } from '../../src/api/annonces';
import { getCurrentUserId } from '../../src/api/auth';
import { Button } from '../../src/components/button';
import { CategoryPicker } from '../../src/components/category-picker';
import { LocationPicker } from '../../src/components/location-picker';
import { TextArea } from '../../src/components/text-area';
import { TextField } from '../../src/components/text-field';
import type { Coordinates } from '../../src/lib/distance';
import { annonceCreateSchema } from '../../src/schemas/annonce';
import type { JobCategory } from '../../src/schemas/job-category';

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }
  return <Text className="font-sans text-xs text-danger">{message}</Text>;
}

export default function NewAnnonceScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<JobCategory | null>(null);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const createMutation = useMutation({
    mutationFn: async () => {
      const result = annonceCreateSchema.safeParse({ title, description, category, location });
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

      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('No authenticated user');
      }
      return createAnnonce(userId, result.data);
    },
    onSuccess: (annonce) => {
      router.replace(`/annonces/${annonce.id}`);
    },
  });

  return (
    <SafeAreaView className="flex-1 bg-sand">
      <ScrollView contentContainerClassName="gap-6 px-6 pb-10 pt-6">
        <Text className="font-sans-extrabold text-3xl text-ink-900">Publicar anuncio</Text>

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
          <Text className="font-sans-semibold text-sm text-olive-700">Ubicación</Text>
          <LocationPicker value={location} onChange={setLocation} />
          <FieldError message={fieldErrors.location} />
        </View>

        {createMutation.isError ? (
          <Text className="font-sans text-xs text-danger">
            {createMutation.error instanceof Error
              ? createMutation.error.message
              : 'No se pudo publicar el anuncio. Inténtalo de nuevo.'}
          </Text>
        ) : null}

        <Button
          size="lg"
          onPress={() => createMutation.mutate()}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? 'Publicando…' : 'Publicar'}
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
