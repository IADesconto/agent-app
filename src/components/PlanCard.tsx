import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CheckCircleIcon } from './icons';
import { colors, spacing, borderRadius } from '../theme';

export interface Plan {
  id: string;
  name: string;
  price: string;
  agents: string;
  mcp: string;
  features: string[];
  highlighted?: boolean;
}

interface PlanCardProps {
  plan: Plan;
  selected?: boolean;
  onPress: (plan: Plan) => void;
}

export function PlanCard({ plan, selected, onPress }: PlanCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardSelected, plan.highlighted && styles.cardHighlighted]}
      onPress={() => onPress(plan)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.name}>{plan.name}</Text>
        {plan.highlighted && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Popular</Text>
          </View>
        )}
      </View>
      <Text style={styles.price}>
        {plan.price}
        <Text style={styles.pricePeriod}>/mes</Text>
      </Text>
      <View style={styles.limits}>
        <View style={styles.limitRow}>
          <Text style={styles.limitLabel}>Agentes</Text>
          <Text style={styles.limitValue}>{plan.agents}</Text>
        </View>
        <View style={styles.limitRow}>
          <Text style={styles.limitLabel}>MCP</Text>
          <Text style={styles.limitValue}>{plan.mcp}</Text>
        </View>
      </View>
      <View style={styles.features}>
        {plan.features.map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <CheckCircleIcon size={12} color={colors.accent} />
            <Text key={i} style={styles.feature}>{f}</Text>
          </View>
        ))}
      </View>
      {selected && (
        <View style={styles.checkmark}>
          <CheckCircleIcon size={20} color={colors.black} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    position: 'relative',
  },
  cardSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentMuted,
  },
  cardHighlighted: {
    borderColor: colors.accent + '50',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  name: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  badge: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '700',
  },
  price: {
    color: colors.accent,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: spacing.lg,
  },
  pricePeriod: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '400',
  },
  limits: {
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  limitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  limitLabel: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  limitValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  features: {
    gap: spacing.xs,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  feature: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  checkmark: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
});
