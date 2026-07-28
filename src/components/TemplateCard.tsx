import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getTemplateIcon, CheckIcon } from './icons';
import { colors, spacing, borderRadius } from '../theme';

interface TemplateCardProps {
  id: string;
  name: string;
  description?: string;
  selected?: boolean;
  onPress: (id: string) => void;
}

export function TemplateCard({ id, name, description, selected, onPress }: TemplateCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardSelected]}
      onPress={() => onPress(id)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, selected && styles.iconContainerSelected]}>
        {getTemplateIcon(id)}
      </View>
      <Text style={[styles.name, selected && styles.nameSelected]}>{name}</Text>
      {description ? <Text style={styles.desc} numberOfLines={2}>{description}</Text> : null}
      {selected && (
        <View style={styles.checkmark}>
          <CheckIcon size={14} color={colors.black} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    width: 140,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    position: 'relative',
  },
  cardSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentMuted,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconContainerSelected: {
    backgroundColor: colors.accentGlow,
  },
  name: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  nameSelected: {
    color: colors.accent,
  },
  desc: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
