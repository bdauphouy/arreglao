import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { requestEmailOtp, verifyEmailOtp } from '../../src/api/auth';
import { emailSchema, otpSchema, type EmailInput, type OtpInput } from '../../src/schemas/auth';

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
    <View style={styles.container}>
      <Text style={styles.heading}>Ingresa tu correo</Text>
      <Text style={styles.subtitle}>Te enviaremos un código de verificación por correo.</Text>

      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => (
          <>
            <TextInput
              style={styles.input}
              placeholder="correo@ejemplo.com"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              value={field.value}
              onChangeText={field.onChange}
            />
            {fieldState.error ? <Text style={styles.error}>{fieldState.error.message}</Text> : null}
          </>
        )}
      />
      {requestOtp.isError ? (
        <Text style={styles.error}>No se pudo enviar el código. Inténtalo de nuevo.</Text>
      ) : null}

      <Pressable
        style={styles.button}
        onPress={handleSubmit((data) => requestOtp.mutate(data))}
        disabled={requestOtp.isPending}
      >
        <Text style={styles.buttonText}>{requestOtp.isPending ? 'Enviando…' : 'Continuar'}</Text>
      </Pressable>
    </View>
  );
}

function OtpStep({ email, onChangeEmail }: { email: string; onChangeEmail: () => void }) {
  const { control, handleSubmit } = useForm<OtpInput>({
    resolver: zodResolver(otpSchema),
    defaultValues: { token: '' },
  });
  const verifyOtp = useMutation({
    mutationFn: (data: OtpInput) => verifyEmailOtp(email, data.token),
    onSuccess: () => router.replace('/'),
  });
  const resendOtp = useMutation({
    mutationFn: () => requestEmailOtp(email),
  });

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Verifica tu correo</Text>
      <Text style={styles.subtitle}>Ingresa el código de 6 dígitos que enviamos a {email}.</Text>

      <Controller
        control={control}
        name="token"
        render={({ field, fieldState }) => (
          <>
            <TextInput
              style={styles.input}
              placeholder="Código de verificación"
              keyboardType="number-pad"
              maxLength={6}
              value={field.value}
              onChangeText={field.onChange}
            />
            {fieldState.error ? <Text style={styles.error}>{fieldState.error.message}</Text> : null}
          </>
        )}
      />
      {verifyOtp.isError ? <Text style={styles.error}>Código inválido.</Text> : null}
      {resendOtp.isError ? <Text style={styles.error}>No se pudo reenviar el código.</Text> : null}

      <Pressable
        style={styles.button}
        onPress={handleSubmit((data) => verifyOtp.mutate(data))}
        disabled={verifyOtp.isPending}
      >
        <Text style={styles.buttonText}>{verifyOtp.isPending ? 'Verificando…' : 'Verificar'}</Text>
      </Pressable>

      <Pressable onPress={() => resendOtp.mutate()} disabled={resendOtp.isPending}>
        <Text style={styles.link}>{resendOtp.isPending ? 'Reenviando…' : 'Reenviar código'}</Text>
      </Pressable>

      <Pressable onPress={onChangeEmail}>
        <Text style={styles.link}>Cambiar correo</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center', gap: 12 },
  heading: { fontSize: 24, fontWeight: '700' },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  error: { color: '#c0392b', fontSize: 12 },
  button: {
    backgroundColor: '#111',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  link: { textAlign: 'center', color: '#111', fontWeight: '500', marginTop: 4 },
});
