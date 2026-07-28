import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, borderRadius } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Configure seu Google Client ID no Google Cloud Console
// https://console.cloud.google.com/apis/credentials
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

// Carrega o script do Google Identity Services dinamicamente
function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') { resolve(); return; }
    if ((window as any).google?.accounts?.id) { resolve(); return; }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Falha ao carregar Google Identity Services'));
    document.head.appendChild(script);
  });
}

export function LoginScreen() {
  const { login, signup, googleLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const tabAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (GOOGLE_CLIENT_ID.startsWith('YOUR_')) return;
    loadGoogleScript().catch(() => {});
  }, []);

  function switchTab(signup: boolean) {
    setIsSignup(signup);
    Animated.spring(tabAnim, {
      toValue: signup ? 1 : 0,
      useNativeDriver: false,
      tension: 100,
      friction: 10,
    }).start();
  }

  async function handleSubmit() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Atencao', 'Preencha todos os campos');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Atencao', 'A senha deve ter no minimo 6 caracteres');
      return;
    }

    setLoading(true);
    const error = isSignup
      ? await signup(email.trim().toLowerCase(), password)
      : await login(email.trim().toLowerCase(), password);

    setLoading(false);

    if (error) {
      Alert.alert('Erro', error);
    }
  }

  function handleGoogleLogin() {
    if (GOOGLE_CLIENT_ID.startsWith('YOUR_')) {
      Alert.alert(
        'Configuracao necessaria',
        'Configure o GOOGLE_CLIENT_ID no arquivo LoginScreen.tsx.\n\nObtenha seu Client ID em:\nconsole.cloud.google.com/apis/credentials'
      );
      return;
    }
    if (typeof window === 'undefined' || !(window as any).google?.accounts?.id) {
      Alert.alert('Erro', 'Google Identity Services nao disponivel. Recarregue a pagina.');
      return;
    }

    setGoogleLoading(true);
    const google = (window as any).google;

    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response: any) => {
        if (!response.credential) {
          setGoogleLoading(false);
          Alert.alert('Erro', 'Nao foi possivel obter o token do Google.');
          return;
        }
        const err = await googleLogin(response.credential);
        setGoogleLoading(false);
        if (err) Alert.alert('Erro', err);
      },
      auto_select: false,
      cancel_on_tap_outside: false,
    });

    google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        setGoogleLoading(false);
        Alert.alert('Aviso', 'O popup do Google foi bloqueado. Verifique as configuracoes do navegador.');
      }
    });
  }

  const tabIndicatorLeft = tabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '50%'],
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header */}
        <View style={styles.brandSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logoGlow} />
            <Text style={styles.logoIcon}>{'\u{1F916}'}</Text>
          </View>
          <Text style={styles.brandName}>10ContoAI</Text>
          <Text style={styles.tagline}>
            Agentes de IA inteligentes{'\n'}para o seu negocio
          </Text>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => switchTab(false)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, !isSignup && styles.tabTextActive]}>
              Entrar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => switchTab(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, isSignup && styles.tabTextActive]}>
              Cadastrar
            </Text>
          </TouchableOpacity>
          <Animated.View
            style={[styles.tabIndicator, { left: tabIndicatorLeft }]}
          />
        </View>

        {/* Google Button */}
        <TouchableOpacity
          style={[styles.googleButton, googleLoading && styles.submitButtonDisabled]}
          onPress={handleGoogleLogin}
          disabled={googleLoading}
          activeOpacity={0.8}
        >
          {googleLoading ? (
            <ActivityIndicator color={colors.text} size="small" />
          ) : (
            <>
              <View style={styles.googleIconContainer}>
                <Text style={styles.googleIcon}>G</Text>
              </View>
              <Text style={styles.googleText}>Continuar com Google</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ou continue com email</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Form */}
        <View style={styles.form}>
          {isSignup && (
            <View style={[
              styles.inputWrapper,
              focusedInput === 'name' && styles.inputWrapperFocused,
            ]}>
              <Text style={styles.inputIcon}>{'\u{1F464}'}</Text>
              <TextInput
                style={styles.input}
                placeholder="Nome completo"
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={setName}
                onFocus={() => setFocusedInput('name')}
                onBlur={() => setFocusedInput(null)}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={[
            styles.inputWrapper,
            focusedInput === 'email' && styles.inputWrapperFocused,
          ]}>
            <Text style={styles.inputIcon}>{'\u{2709}'}</Text>
            <TextInput
              style={styles.input}
              placeholder="seu@email.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocusedInput('email')}
              onBlur={() => setFocusedInput(null)}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={[
            styles.inputWrapper,
            focusedInput === 'password' && styles.inputWrapperFocused,
          ]}>
            <Text style={styles.inputIcon}>{'\u{1F512}'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Sua senha"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocusedInput('password')}
              onBlur={() => setFocusedInput(null)}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.9}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isSignup ? 'Criar conta gratuita' : 'Entrar'}
              </Text>
            )}
            {!loading && (
              <Text style={styles.submitArrow}>{'\u2192'}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footerText}>
          Ao continuar, voce concorda com nossos{' '}
          <Text style={styles.footerLink}>Termos de Uso</Text>
          {' '}e{' '}
          <Text style={styles.footerLink}>Politica de Privacidade</Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl + 4,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.xxl,
  },
  // Brand
  brandSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl + 4,
  },
  logoContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.accentMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.accent + '30',
  },
  logoGlow: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.accent + '15',
    transform: [{ scale: 1.4 }],
  },
  logoIcon: {
    fontSize: 40,
  },
  brandName: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -1.5,
    marginBottom: spacing.sm,
  },
  tagline: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  // Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: 3,
    marginBottom: spacing.xl,
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    zIndex: 1,
    borderRadius: borderRadius.md,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: '#000',
  },
  tabIndicator: {
    position: 'absolute',
    top: 3,
    width: '50%',
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: borderRadius.md,
    marginTop: -3,
    marginLeft: -3,
    paddingVertical: 0,
  },
  // Google
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md + 2,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: spacing.md,
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleIcon: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4285F4',
  },
  googleText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
    gap: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.cardBorder,
  },
  dividerText: {
    color: colors.textMuted,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  // Form
  form: {
    gap: spacing.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    gap: spacing.md,
  },
  inputWrapperFocused: {
    borderColor: colors.accent + '60',
    backgroundColor: colors.accentMuted,
  },
  inputIcon: {
    fontSize: 18,
    opacity: 0.6,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.lg,
    fontSize: 15,
    color: colors.text,
  },
  submitButton: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.lg,
    padding: spacing.lg + 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  submitArrow: {
    color: '#000',
    fontSize: 18,
    fontWeight: '700',
  },
  // Footer
  footerText: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: spacing.xxl,
    lineHeight: 18,
    paddingHorizontal: spacing.lg,
  },
  footerLink: {
    color: colors.accent,
    fontWeight: '600',
  },
});
