import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { requestPhoneOtp, verifyPhoneOtp } from '../../src/api/auth';
import { otpSchema, phoneSchema, type OtpInput, type PhoneInput } from '../../src/schemas/auth';

export default function SignInScreen() {
  const [phone, setPhone] = useState<string | null>(null);

  if (phone) {
    return <OtpStep phone={phone} onChangeNumber={() => setPhone(null)} />;
  }

  return <PhoneStep onCodeSent={setPhone} />;
}

function PhoneStep({ onCodeSent }: { onCodeSent: (phone: string) => void }) {
  const { control, handleSubmit } = useForm<PhoneInput>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '' },
  });
  const requestOtp = useMutation({
    mutationFn: (data: PhoneInput) => requestPhoneOtp(data.phone),
    onSuccess: (_, data) => onCodeSent(data.phone),
  });

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Ingresa tu número</Text>
      <Text style={styles.subtitle}>
        Te enviaremos un código de verificación por SMS. Incluye el código de tu país, ej.
        +15555550100.
      </Text>

      <Controller
        control={control}
        name="phone"
        render={({ field, fieldState }) => (
          <>
            <TextInput
              style={styles.input}
              placeholder="Número de teléfono"
              autoCapitalize="none"
              autoComplete="tel"
              keyboardType="phone-pad"
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

function OtpStep({ phone, onChangeNumber }: { phone: string; onChangeNumber: () => void }) {
  const { control, handleSubmit } = useForm<OtpInput>({
    resolver: zodResolver(otpSchema),
    defaultValues: { token: '' },
  });
  const verifyOtp = useMutation({
    mutationFn: (data: OtpInput) => verifyPhoneOtp(phone, data.token),
    onSuccess: () => router.replace('/'),
  });
  const resendOtp = useMutation({
    mutationFn: () => requestPhoneOtp(phone),
  });

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Verifica tu número</Text>
      <Text style={styles.subtitle}>Ingresa el código de 6 dígitos que enviamos a {phone}.</Text>

      <Controller
        control={control}
        name="token"
        render={({ field, fieldState }) => (
          <>
            <TextInput
              style={styles.input}
              placeholder="Código de verificación"
              autoComplete="sms-otp"
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

      <Pressable onPress={onChangeNumber}>
        <Text style={styles.link}>Cambiar número</Text>
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
