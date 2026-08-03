import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { requestEmailOtp, verifyEmailOtp } from '../../src/api/auth';
import { getProfile } from '../../src/api/profiles';
import { emailSchema, otpSchema, type EmailInput, type OtpInput } from '../../src/schemas/auth';
import { OtpDigitsInput } from '../../src/components/otp-digits-input';
import { TextField } from '../../src/components/text-field';

class ProfileLookupError extends Error {}

export default function SignInScreen() {
  const [email, setEmail] = useState<string | null>(null);

  if (email) {
    return <OtpStep email={email} onChangeEmail={() => setEmail(null)} />;
  }

  return <EmailStep onCodeSent={setEmail} />;
}

function EmailStep({ onCodeSent }: { onCodeSent: (email: string) => void }) {
  const { control, handleSubmit } = useForm<EmailInput>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });
  const requestOtp = useMutation({
    mutationFn: (data: EmailInput) => requestEmailOtp(data.email),
    onSuccess: (_, data) => onCodeSent(data.email),
  });

  return (
    <SafeAreaView className="flex-1 bg-sand">
      <View className="flex-1 justify-center gap-6 px-6">
        <View className="gap-3">
          <Text className="font-sans-extrabold text-3xl text-ink-900">Ingresa tu correo</Text>
          <Text className="font-sans text-base text-olive-600">
            Te enviaremos un código de 6 dígitos para ingresar.
          </Text>
        </View>

        <View className="gap-3">
          <Controller
            control={control}
            name="email"
            render={({ field, fieldState }) => (
              <>
                <TextField
                  placeholder="correo@ejemplo.com"
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  value={field.value}
                  onChangeText={field.onChange}
                />
                {fieldState.error ? (
                  <Text className="font-sans text-xs text-red-700">{fieldState.error.message}</Text>
                ) : null}
              </>
            )}
          />
          {requestOtp.isError ? (
            <Text className="font-sans text-xs text-red-700">
              No se pudo enviar el código. Inténtalo de nuevo.
            </Text>
          ) : null}
        </View>
      </View>

      <View className="px-6 pb-6">
        <Pressable
          className="items-center rounded-full bg-accent px-6 py-4 active:bg-accent-active"
          onPress={handleSubmit((data) => requestOtp.mutate(data))}
          disabled={requestOtp.isPending}
        >
          <Text className="font-sans-semibold text-base text-ink-900">
            {requestOtp.isPending ? 'Enviando…' : 'Continuar'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function OtpStep({ email, onChangeEmail }: { email: string; onChangeEmail: () => void }) {
  const { control, handleSubmit } = useForm<OtpInput>({
    resolver: zodResolver(otpSchema),
    defaultValues: { token: '' },
  });
  const verifyOtp = useMutation({
    mutationFn: async (data: OtpInput) => {
      const { user } = await verifyEmailOtp(email, data.token);
      if (!user) {
        throw new ProfileLookupError('No user returned from OTP verification');
      }
      try {
        return await getProfile(user.id);
      } catch (cause) {
        throw new ProfileLookupError('Failed to load profile after verification', { cause });
      }
    },
    onSuccess: (profile) => {
      router.replace(profile.firstName ? '/' : '/(auth)/profile-details');
    },
  });
  const resendOtp = useMutation({
    mutationFn: () => requestEmailOtp(email),
  });

  return (
    <SafeAreaView className="flex-1 bg-sand">
      <View className="flex-1 justify-center gap-6 px-6">
        <View className="gap-3">
          <Text className="font-sans-extrabold text-3xl text-ink-900">Ingresa tu código</Text>
          <Text className="font-sans text-base text-olive-600">
            Te enviamos un código de 6 dígitos a {email}.
          </Text>
        </View>

        <View className="gap-3">
          <Controller
            control={control}
            name="token"
            render={({ field, fieldState }) => (
              <>
                <OtpDigitsInput value={field.value} onChange={field.onChange} />
                {fieldState.error ? (
                  <Text className="font-sans text-xs text-red-700">{fieldState.error.message}</Text>
                ) : null}
              </>
            )}
          />
          {verifyOtp.isError ? (
            <Text className="font-sans text-xs text-red-700">
              {verifyOtp.error instanceof ProfileLookupError
                ? 'Verificamos tu código, pero no pudimos cargar tu perfil. Inténtalo de nuevo.'
                : 'Código inválido.'}
            </Text>
          ) : null}
          {resendOtp.isError ? (
            <Text className="font-sans text-xs text-red-700">No se pudo reenviar el código.</Text>
          ) : null}
        </View>
      </View>

      <View className="gap-3 px-6 pb-6">
        <Pressable
          className="items-center rounded-full bg-accent px-6 py-4 active:bg-accent-active"
          onPress={handleSubmit((data) => verifyOtp.mutate(data))}
          disabled={verifyOtp.isPending}
        >
          <Text className="font-sans-semibold text-base text-ink-900">
            {verifyOtp.isPending ? 'Ingresando…' : 'Ingresar'}
          </Text>
        </Pressable>

        <Pressable
          className="items-center rounded-full bg-white px-6 py-4"
          onPress={() => resendOtp.mutate()}
          disabled={resendOtp.isPending}
        >
          <Text className="font-sans-semibold text-base text-ink-900">
            {resendOtp.isPending ? 'Reenviando…' : 'Reenviar código'}
          </Text>
        </Pressable>

        <Pressable className="items-center rounded-full bg-white px-6 py-4" onPress={onChangeEmail}>
          <Text className="font-sans-semibold text-base text-ink-900">Cambiar correo</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
