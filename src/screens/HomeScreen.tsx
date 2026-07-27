import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { AgentCard } from '../components/AgentCard';
import { TemplateCard } from '../components/TemplateCard';
import * as api from '../api/client';
import { colors, spacing, borderRadius } from '../theme';

interface Agent {
  id: string;
  name: string;
  type: string;
  model: string;
  status: string;
}

const ALL_TEMPLATES = [
  { id: 'assistente-financeiro', name: 'Financeiro', description: 'Analise financeira e investimentos' },
  { id: 'assistente-contabil', name: 'Contabil', description: 'Contabilidade e impostos' },
  { id: 'assistente-vendas', name: 'Vendas', description: 'Pipeline e CRM inteligente' },
  { id: 'assistente-suporte', name: 'Suporte', description: 'Atendimento ao cliente 24/7' },
  { id: 'assistente-dev', name: 'Dev', description: 'Codigo, debug e deploy' },
  { id: 'assistente-marketing', name: 'Marketing', description: 'Campanhas e SEO' },
  { id: 'assistente-dados', name: 'Dados', description: 'Dashboards e analises' },
  { id: 'assistente-navegador', name: 'Navegador Web', description: 'Busca e automacao web' },
  { id: 'assistente-juridico', name: 'Juridico', description: 'Contratos e compliance' },
  { id: 'assistente-rh', name: 'RH', description: 'Recrutamento e cultura' },
];

export function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);
  const [creating, setCreating] = useState<string | null>(null);

  async function loadAgents() {
    if (!user) return;
    const { data } = await api.listAgents(user.tenant_id);
    if (data) {
      setAgents(data);
    }
  }

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadAgents().finally(() => setLoading(false));
    }, [user?.tenant_id])
  );

  async function onRefresh() {
    setRefreshing(true);
    await loadAgents();
    setRefreshing(false);
  }

  async function handleCreateAgent(templateId: string) {
    if (!user) return;
    setCreating(templateId);
    const { data, error } = await api.createAgentFromTemplate(user.tenant_id, templateId);
    setCreating(null);
    if (error) {
      // Alert handled silently
    } else if (data) {
      setAgents(prev => [...prev, data]);
      setShowCatalog(false);
    }
  }

  function handleAgentPress(agent: Agent) {
    navigation.navigate('Chat', { agent });
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Text style={styles.menuIcon}>{'\u2630'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Meus Agentes</Text>
        <TouchableOpacity onPress={() => setShowCatalog(!showCatalog)}>
          <View style={styles.addBtn}>
            <Text style={styles.addBtnText}>{showCatalog ? '{ }\xd7' : '+'}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Template catalog (expandable) */}
      {showCatalog && (
        <View style={styles.catalog}>
          <Text style={styles.catalogTitle}>Adicionar novo agente</Text>
          <FlatList
            horizontal
            data={ALL_TEMPLATES}
            keyExtractor={item => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.catalogList}
            renderItem={({ item }) => (
              <TemplateCard
                id={item.id}
                name={item.name}
                description={item.description}
                onPress={handleCreateAgent}
              />
            )}
          />
          {creating && (
            <View style={styles.creatingOverlay}>
              <ActivityIndicator size="small" color={colors.accent} />
              <Text style={styles.creatingText}>Criando agente...</Text>
            </View>
          )}
        </View>
      )}

      {/* Agent list */}
      <FlatList
        data={agents}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>{'\u{1F916}'}</Text>
            <Text style={styles.emptyTitle}>Nenhum agente ainda</Text>
            <Text style={styles.emptySubtitle}>
              Toque no '+' para adicionar seu primeiro agente
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <AgentCard agent={item} onPress={handleAgentPress} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 56,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },
  menuIcon: {
    color: colors.text,
    fontSize: 24,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: {
    color: '#000',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 22,
  },
  catalog: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  catalogTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  catalogList: {
    gap: spacing.md,
  },
  creatingOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  creatingText: {
    color: colors.accent,
    fontSize: 13,
  },
  listContent: {
    paddingVertical: spacing.sm,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    color: colors.textSecondary,
    fontSize: 15,
  },
});
