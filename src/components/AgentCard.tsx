import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from '../theme';

interface Agent {
  id: string;
  name: string;
  type: string;
  model: string;
  status: string;
}

const AGENT_ICONS: Record<string, string> = {
  'assistente-financeiro': '\u{1F4B0}',
  'assistente-contabil': '\u{1F4D1}',
  'assistente-vendas': '\u{1F4C8}',
  'assistente-suporte': '\u{1F9D1}\u200D\u{1F4BB}',
  'assistente-dev': '\u{1F4BB}',
  'assistente-marketing': '\u{1F4E3}',
  'assistente-dados': '\u{1F4CA}',
  'assistente-navegador': '\u{1F310}',
  'assistente-juridico': '\u2696\uFE0F',
  'assistente-rh': '\u{1F465}',
};

const AGENT_NAMES: Record<string, string> = {
  'assistente-financeiro': 'Financeiro',
  'assistente-contabil': 'Contabil',
  'assistente-vendas': 'Vendas',
  'assistente-suporte': 'Suporte',
  'assistente-dev': 'Dev',
  'assistente-marketing': 'Marketing',
  'assistente-dados': 'Dados',
  'assistente-navegador': 'Navegador Web',
  'assistente-juridico': 'Juridico',
  'assistente-rh': 'RH',
};

interface AgentCardProps {
  agent: Agent;
  onPress: (agent: Agent) => void;
}

export function AgentCard({ agent, onPress }: AgentCardProps) {
  const icon = AGENT_ICONS[agent.type] || '\u{1F916}';
  const typeName = AGENT_NAMES[agent.type] || agent.type;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(agent)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{agent.name}</Text>
        <Text style={styles.type}>{typeName} · {agent.model}</Text>
      </View>
      <View style={[styles.statusDot, agent.status === 'active' ? styles.statusActive : styles.statusInactive]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accentMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  icon: {
    fontSize: 22,
  },
  info: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  type: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: spacing.sm,
  },
  statusActive: {
    backgroundColor: colors.accent,
  },
  statusInactive: {
    backgroundColor: colors.textMuted,
  },
});
