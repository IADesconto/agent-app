import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { UserIcon, ChevronRightIcon, LogOutIcon, CrownIcon, SettingsIcon } from '../components/icons';
import * as api from '../api/client';
import { colors, spacing, borderRadius } from '../theme';

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadProfile();
  }, [user]);

  async function loadProfile() {
    if (!user) return;
    const [profileRes, planRes] = await Promise.all([
      api.getProfile(user.tenant_id),
      api.getTenantPlan(user.tenant_id),
    ]);
    if (profileRes.data) setProfile(profileRes.data);
    if (planRes.data) setPlan(planRes.data);
    setLoading(false);
  }

  function handleLogout() {
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}><Text style={styles.title}>Perfil</Text></View>
        <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 80 }} />
      </View>
    );
  }

  const displayName = profile?.name || user?.email?.split('@')[0] || 'Usuario';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Perfil</Text>
      </View>

      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.tenant}>Tenant: {user?.tenant_id}</Text>
      </View>

      {plan && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plano</Text>
          <View style={styles.planCard}>
            <View style={styles.planHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <CrownIcon size={18} color={colors.accent} />
                <Text style={styles.planName}>{plan.name || 'Starter'}</Text>
              </View>
              <View style={styles.planBadge}>
                <Text style={styles.planBadgeText}>Ativo</Text>
              </View>
            </View>
            <Text style={styles.planPrice}>
              {plan.price_display || `R$ ${plan.price_monthly || plan.price || '600'}`}
              <Text style={styles.planPeriod}>/mes</Text>
            </Text>
            <View style={styles.planLimits}>
              <View style={styles.limitItem}>
                <Text style={styles.limitValue}>{plan.agent_limit ?? '?'}</Text>
                <Text style={styles.limitLabel}>Agentes</Text>
              </View>
              <View style={styles.limitItem}>
                <Text style={styles.limitValue}>{plan.mcp_limit ?? '?'}</Text>
                <Text style={styles.limitLabel}>MCP</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.upgradeBtn}>
              <Text style={styles.upgradeBtnText}>Gerenciar plano</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configuracoes</Text>
        <TouchableOpacity style={styles.menuItem}>
          <UserIcon size={18} color={colors.textSecondary} />
          <Text style={styles.menuItemText}>Notificacoes</Text>
          <ChevronRightIcon size={18} color={colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <SettingsIcon size={18} color={colors.textSecondary} />
          <Text style={styles.menuItemText}>Idioma</Text>
          <Text style={styles.menuItemValue}>Portugues</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <LogOutIcon size={18} color={colors.danger} />
        <Text style={styles.logoutBtnText}>Sair da conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxl },
  header: {
    paddingTop: 56, paddingBottom: spacing.md, paddingHorizontal: spacing.xl,
    backgroundColor: colors.background,
  },
  title: { color: colors.text, fontSize: 22, fontWeight: '700' },
  avatarSection: { alignItems: 'center', paddingVertical: spacing.xxl },
  avatar: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: colors.accent,
    justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md,
  },
  avatarText: { color: '#000', fontSize: 28, fontWeight: '700' },
  name: { color: colors.text, fontSize: 20, fontWeight: '700', marginBottom: 4 },
  email: { color: colors.textSecondary, fontSize: 14 },
  tenant: { color: colors.textMuted, fontSize: 12, marginTop: spacing.xs },
  section: { paddingHorizontal: spacing.xl, marginBottom: spacing.xl },
  sectionTitle: {
    color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: spacing.md,
    textTransform: 'uppercase', letterSpacing: 1,
  },
  planCard: {
    backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.xl,
    borderWidth: 1, borderColor: colors.cardBorder,
  },
  planHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.sm,
  },
  planName: { color: colors.text, fontSize: 18, fontWeight: '700' },
  planBadge: {
    backgroundColor: colors.accentMuted, borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm, paddingVertical: 2,
  },
  planBadgeText: { color: colors.accent, fontSize: 11, fontWeight: '600' },
  planPrice: { color: colors.accent, fontSize: 24, fontWeight: '800', marginBottom: spacing.lg },
  planPeriod: { color: colors.textSecondary, fontSize: 14, fontWeight: '400' },
  planLimits: { flexDirection: 'row', gap: spacing.xxl, marginBottom: spacing.lg },
  limitItem: { alignItems: 'center' },
  limitValue: { color: colors.text, fontSize: 22, fontWeight: '700' },
  limitLabel: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  upgradeBtn: {
    borderWidth: 1, borderColor: colors.accent, borderRadius: borderRadius.md,
    padding: spacing.md, alignItems: 'center',
  },
  upgradeBtnText: { color: colors.accent, fontSize: 14, fontWeight: '600' },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card,
    borderRadius: borderRadius.md, padding: spacing.lg, marginBottom: spacing.xs,
    borderWidth: 1, borderColor: colors.cardBorder, gap: spacing.md,
  },
  menuItemText: { flex: 1, color: colors.text, fontSize: 15 },
  menuItemValue: { color: colors.textSecondary, fontSize: 14 },
  logoutBtn: {
    flexDirection: 'row', marginHorizontal: spacing.xl, backgroundColor: colors.danger + '10',
    borderRadius: borderRadius.md, padding: spacing.lg, alignItems: 'center',
    borderWidth: 1, borderColor: colors.danger + '20', gap: spacing.md, justifyContent: 'center',
  },
  logoutBtnText: { color: colors.danger, fontSize: 15, fontWeight: '600' },
});
