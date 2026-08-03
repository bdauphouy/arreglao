import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { updateProfileName } from '../../src/api/profiles';
import { supabase } from '../../src/lib/supabase';
import { profileDetailsSchema, type ProfileDetailsInput } from '../../src/schemas/profile';
import { Button } from '../../src/components/button';
import { TextField } from '../../src/components/text-field';

export default function ProfileDetailsScreen() {
  const { control, handleSubmit } = useForm<ProfileDetailsInput>({
    resolver: zodResolver(profileDetailsSchema),
    defaultValues: { firstName: '', lastName: '' },
  });

  const saveProfile = useMutation({
    mutationFn: async (data: ProfileDetailsInput) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user');
      }
      await updateProfileName(user.id, data);
    },
    onSuccess: () => router.replace('/(tabs)'),
  });

  return (
    <SafeAreaView className="flex-1 bg-sand">
      <View className="flex-1 justify-center gap-6 px-6">
        <View className="gap-3">
          <Text className="font-sans-extrabold text-3xl text-ink-900">Cuéntanos de ti</Text>
          <Text className="font-sans text-base text-olive-600">
            Así te van a reconocer los demás usuarios en Arreglao.
          </Text>
        </View>

        <View className="gap-3">
          <Controller
            control={control}
            name="firstName"
            render={({ field, fieldState }) => (
              <>
                <TextField
                  placeholder="Nombre"
                  autoCapitalize="words"
                  autoComplete="given-name"
                  value={field.value}
                  onChangeText={field.onChange}
                />
                {fieldState.error ? (
                  <Text className="font-sans text-sm text-danger">{fieldState.error.message}</Text>
                ) : null}
              </>
            )}
          />

          <Controller
            control={control}
            name="lastName"
            render={({ field, fieldState }) => (
              <>
                <TextField
                  placeholder="Apellido"
                  autoCapitalize="words"
                  autoComplete="family-name"
                  value={field.value}
                  onChangeText={field.onChange}
                />
                {fieldState.error ? (
                  <Text className="font-sans text-sm text-danger">{fieldState.error.message}</Text>
                ) : null}
              </>
            )}
          />

          {saveProfile.isError ? (
            <Text className="font-sans text-sm text-danger">
              No se pudo guardar tu información. Inténtalo de nuevo.
            </Text>
          ) : null}
        </View>
      </View>

      <View className="px-6 pb-6">
        <Button
          size="lg"
          onPress={handleSubmit((data) => saveProfile.mutate(data))}
          disabled={saveProfile.isPending}
        >
          {saveProfile.isPending ? 'Guardando…' : 'Continuar'}
        </Button>
      </View>
    </SafeAreaView>
  );
}
