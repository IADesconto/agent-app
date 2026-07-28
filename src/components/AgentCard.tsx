import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getAgentIconComponent, ChevronRightIcon } from './icons';
import { colors, spacing, borderRadius } from '../theme';

interface Agent {
  id: string;
  name: string;
  type: string;
  model: string;
  status: string;
}

interface AgentCardProps {
  agent: Agent;
  onPress: (agent: Agent) => void;
}

export function AgentCard({ agent, onPress }: AgentCardProps) {
  const isActive = agent.status === 'active' || agent.status === 'idle';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(agent)}
      activeOpacity={0.7}
    >
      <View style={styles.iconWrap}>
        {getAgentIconComponent(agent.name)}
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{agent.name}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.model}>{agent.model}</Text>
          <View style={[styles.statusDot, isActive && styles.statusActive]} />
          <Text style={[styles.statusLabel, isActive && styles.statusLabelActive]}>
            {isActive ? 'online' : 'offline'}
          </Text>
        </View>
      </View>
      <ChevronRightIcon size={20} color={colors.textMuted} />
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
    marginVertical: 5,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.accentMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  model: {
    color: colors.textMuted,
    fontSize: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textMuted,
  },
  statusActive: {
    backgroundColor: colors.accent,
  },
  statusLabel: {
    color: colors.textMuted,
    fontSize: 11,
  },
  statusLabelActive: {
    color: colors.accent,
  },
});
