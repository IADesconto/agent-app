import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, borderRadius } from '../theme';

export function ProfileScreen() {
  const { user, logout } = useAuth();

  function handleLogout() {
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Perfil</Text>
      </View>

      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.email ? user.email.charAt(0).toUpperCase() : '?'}
          </Text>
        </View>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.tenant}>Tenant: {user?.tenant_id}</Text>
      </View>

      {/* Plan info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Plano</Text>
        <View style={styles.planCard}>
          <View style={styles.planHeader}>
            <Text style={styles.planName}>Starter</Text>
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>Ativo</Text>
            </View>
          </View>
          <Text style={styles.planPrice}>R$ 600<Text style={styles.planPeriod}>/mes</Text></Text>
          <View style={styles.planLimits}>
            <View style={styles.limitItem}>
              <Text style={styles.limitValue}>2</Text>
              <Text style={styles.limitLabel}>Agentes</Text>
            </View>
            <View style={styles.limitItem}>
              <Text style={styles.limitValue}>2</Text>
              <Text style={styles.limitLabel}>MCP</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.upgradeBtn}>
            <Text style={styles.upgradeBtnText}>Fazer upgrade</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configuracoes</Text>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Notificacoes</Text>
          <Text style={styles.menuItemArrow}>{'\u203A'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Idioma</Text>
          <Text style={styles.menuItemValue}>Portugues</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Sobre</Text>
          <Text style={styles.menuItemArrow}>{'\u203A'}</Text>
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutBtnText}>Sair da conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  header: {
    paddingTop: 56,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.background,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    color: '#000',
    fontSize: 28,
    fontWeight: '700',
  },
  email: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  tenant: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: spacing.xs,
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  planCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  planName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  planBadge: {
    backgroundColor: colors.accentMuted,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  planBadgeText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '600',
  },
  planPrice: {
    color: colors.accent,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: spacing.lg,
  },
  planPeriod: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '400',
  },
  planLimits: {
    flexDirection: 'row',
    gap: spacing.xxl,
    marginBottom: spacing.lg,
  },
  limitItem: {
    alignItems: 'center',
  },
  limitValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  limitLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  upgradeBtn: {
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  upgradeBtnText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  menuItemText: {
    color: colors.text,
    fontSize: 15,
  },
  menuItemArrow: {
    color: colors.textMuted,
    fontSize: 22,
  },
  menuItemValue: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  logoutBtn: {
    marginHorizontal: spacing.xl,
    backgroundColor: colors.danger + '15',
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.danger + '30',
  },
  logoutBtnText: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: '600',
  },
});
