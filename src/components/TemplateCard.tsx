import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from '../theme';

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

interface TemplateCardProps {
  id: string;
  name: string;
  description?: string;
  selected?: boolean;
  onPress: (id: string) => void;
}

export function TemplateCard({ id, name, description, selected, onPress }: TemplateCardProps) {
  const icon = AGENT_ICONS[id] || '\u{1F916}';
  const displayName = AGENT_NAMES[id] || name;

  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardSelected]}
      onPress={() => onPress(id)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, selected && styles.iconContainerSelected]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={[styles.name, selected && styles.nameSelected]}>{displayName}</Text>
      {description ? <Text style={styles.desc} numberOfLines={2}>{description}</Text> : null}
      {selected && (
        <View style={styles.checkmark}>
          <Text style={styles.checkmarkText}>{'\u2713'}</Text>
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
    borderRadius: 24,
    backgroundColor: colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconContainerSelected: {
    backgroundColor: colors.accentLight,
  },
  icon: {
    fontSize: 24,
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
  checkmarkText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '700',
  },
});
