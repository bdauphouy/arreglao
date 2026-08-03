import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  displayNameFor,
  updateProfileDetails,
  uploadAvatar,
  type Profile,
} from '../../src/api/profiles';
import { AvatarPicker } from '../../src/components/avatar-picker';
import { Button } from '../../src/components/button';
import { CategoryTagPicker } from '../../src/components/category-tag-picker';
import { LocationPicker } from '../../src/components/location-picker';
import { TextArea } from '../../src/components/text-area';
import { TextField } from '../../src/components/text-field';
import { useCurrentProfile } from '../../src/hooks/use-current-profile';
import { profileEditSchema, type ProfileEditInput } from '../../src/schemas/profile';

export default function MyProfileScreen() {
  const profileQuery = useCurrentProfile();

  if (!profileQuery.data) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-sand">
        <Text className="font-sans text-base text-olive-600">
          {profileQuery.isError ? 'No se pudo cargar tu perfil.' : 'Cargando…'}
        </Text>
      </SafeAreaView>
    );
  }

  return <ProfileEditForm key={profileQuery.data.id} profile={profileQuery.data} />;
}

function ProfileEditForm({ profile }: { profile: Profile }) {
  const queryClient = useQueryClient();
  const [location, setLocation] = useState(profile.location);

  const { control, handleSubmit } = useForm<ProfileEditInput>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      displayName: displayNameFor(profile),
      bio: profile.bio ?? '',
      categoryTags: profile.categoryTags,
    },
  });

  const saveProfile = useMutation({
    mutationFn: (data: ProfileEditInput) => updateProfileDetails(profile.id, { ...data, location }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: (base64: string) => uploadAvatar(profile.id, base64),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
    },
  });

  return (
    <SafeAreaView className="flex-1 bg-sand">
      <ScrollView contentContainerClassName="gap-6 px-6 pb-10 pt-6">
        <View className="items-center gap-3">
          <AvatarPicker
            avatarUrl={profile.avatarUrl}
            uploading={uploadAvatarMutation.isPending}
            onPick={(base64) => uploadAvatarMutation.mutate(base64)}
          />
          {profile.averageRating != null ? (
            <Text className="font-sans text-sm text-olive-600">
              Calificación: {profile.averageRating.toFixed(1)}
            </Text>
          ) : null}
        </View>

        <View className="gap-3">
          <Text className="font-sans-semibold text-sm text-olive-700">Nombre</Text>
          <Controller
            control={control}
            name="displayName"
            render={({ field, fieldState }) => (
              <>
                <TextField
                  value={field.value}
                  onChangeText={field.onChange}
                  placeholder="Nombre visible"
                />
                {fieldState.error ? (
                  <Text className="font-sans text-xs text-danger">{fieldState.error.message}</Text>
                ) : null}
              </>
            )}
          />
        </View>

        <View className="gap-3">
          <Text className="font-sans-semibold text-sm text-olive-700">Sobre ti</Text>
          <Controller
            control={control}
            name="bio"
            render={({ field }) => (
              <TextArea
                placeholder="Cuéntales a los demás en qué puedes ayudar"
                value={field.value}
                onChangeText={field.onChange}
              />
            )}
          />
        </View>

        <View className="gap-3">
          <Text className="font-sans-semibold text-sm text-olive-700">En qué puedes ayudar</Text>
          <Controller
            control={control}
            name="categoryTags"
            render={({ field, fieldState }) => (
              <>
                <CategoryTagPicker value={field.value} onChange={field.onChange} />
                {fieldState.error ? (
                  <Text className="font-sans text-xs text-danger">{fieldState.error.message}</Text>
                ) : null}
              </>
            )}
          />
        </View>

        <View className="gap-3">
          <Text className="font-sans-semibold text-sm text-olive-700">Ubicación</Text>
          <LocationPicker value={location} onChange={setLocation} />
        </View>

        {saveProfile.isError ? (
          <Text className="font-sans text-xs text-danger">
            No se pudo guardar tu perfil. Inténtalo de nuevo.
          </Text>
        ) : null}

        <Button
          size="lg"
          onPress={handleSubmit((data) => saveProfile.mutate(data))}
          disabled={saveProfile.isPending}
        >
          {saveProfile.isPending ? 'Guardando…' : 'Guardar'}
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
