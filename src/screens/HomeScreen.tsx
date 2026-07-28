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
import { MenuIcon, PlusIcon, XIcon, SparklesIcon } from '../components/icons';
import * as api from '../api/client';
import { colors, spacing, borderRadius } from '../theme';

interface Agent {
  id: string;
  name: string;
  type: string;
  model: string;
  status: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
}

export function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);
  const [creating, setCreating] = useState<string | null>(null);

  async function loadData() {
    if (!user) return;
    const [agentsRes, templatesRes] = await Promise.all([
      api.listAgents(user.tenant_id),
      api.listTemplates(),
    ]);
    if (agentsRes.data) setAgents(agentsRes.data);
    if (templatesRes.data) setTemplates(templatesRes.data);
  }

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData().finally(() => setLoading(false));
    }, [user?.tenant_id])
  );

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  async function handleCreateAgent(templateId: string) {
    if (!user) return;
    setCreating(templateId);
    const { data } = await api.createAgentFromTemplate(user.tenant_id, templateId);
    setCreating(null);
    if (data) {
      setAgents(prev => [...prev, data]);
      setShowCatalog(false);
    }
  }

  function handleAgentPress(agent: Agent) {
    navigation.navigate('Chat', { agent });
  }

  const activeCount = agents.filter(a => a.status === 'active' || a.status === 'idle').length;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.headerBtn}>
          <MenuIcon size={22} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.appName}>10ContoAI</Text>
          <Text style={styles.headerSub}>{agents.length} agente{agents.length !== 1 ? 's' : ''}</Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowCatalog(!showCatalog)}
          style={[styles.headerBtn, styles.addBtn, showCatalog && styles.addBtnActive]}
        >
          {showCatalog ? (
            <XIcon size={18} color={colors.black} />
          ) : (
            <PlusIcon size={18} color={colors.black} />
          )}
        </TouchableOpacity>
      </View>

      {/* Template catalog */}
      {showCatalog && (
        <View style={styles.catalog}>
          <View style={styles.catalogHeader}>
            <Text style={styles.catalogTitle}>Novo agente</Text>
            <Text style={styles.catalogHint}>Escolha um template</Text>
          </View>
          <FlatList
            horizontal
            data={templates}
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
            <View style={styles.creatingIndicator}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.creatingText}>Criando agente...</Text>
            </View>
          )}
        </View>
      )}

      {/* Stats bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <SparklesIcon size={14} color={colors.primary} />
          <Text style={styles.statValue}>{activeCount}</Text>
          <Text style={styles.statLabel}>ativos</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{agents.length}</Text>
          <Text style={styles.statLabel}>total</Text>
        </View>
      </View>

      {/* Agent list */}
      <FlatList
        data={agents}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIconWrap}>
              <SparklesIcon size={32} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>Nenhum agente ainda</Text>
            <Text style={styles.emptySubtitle}>
              Toque em + para adicionar seu primeiro agente
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: 56,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtn: {
    backgroundColor: colors.primary,
  },
  addBtnActive: {
    backgroundColor: colors.border,
  },
  headerCenter: {
    alignItems: 'center',
  },
  appName: {
    color: colors.foreground,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerSub: {
    color: colors.mutedForeground,
    fontSize: 11,
    marginTop: 1,
    fontFamily: 'monospace',
  },
  catalog: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  catalogHeader: {
    marginBottom: spacing.md,
  },
  catalogTitle: {
    color: colors.foreground,
    fontSize: 16,
    fontWeight: '700',
  },
  catalogHint: {
    color: colors.mutedForeground,
    fontSize: 12,
    marginTop: 2,
    fontFamily: 'monospace',
  },
  catalogList: {
    gap: spacing.md,
  },
  creatingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  creatingText: {
    color: colors.primary,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    gap: spacing.xl,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statValue: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  statLabel: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: colors.border,
  },
  listContent: {
    paddingVertical: spacing.sm,
    paddingBottom: 100,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: spacing.xxl,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.muted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  emptyTitle: {
    color: colors.foreground,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    color: colors.mutedForeground,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
