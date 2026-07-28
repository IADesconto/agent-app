import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, TextInput, Modal,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { PlusIcon, TrashIcon, ShieldIcon } from '../components/icons';
import * as api from '../api/client';
import { colors, spacing, borderRadius } from '../theme';

interface Tool { id: string; name: string; mcp_server: string; mcp_tool: string; }

interface MCPServer { id: string; name: string; description?: string; }

export function MCPToolsScreen({ route }: any) {
  const { user } = useAuth();
  const agent = route.params.agent;
  const [tools, setTools] = useState<Tool[]>([]);
  const [mcpServers, setMcpServers] = useState<MCPServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingServers, setLoadingServers] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newToolServer, setNewToolServer] = useState('');
  const [newToolName, setNewToolName] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => { if (user) { loadTools(); loadMCPServers(); } }, [user]);

  async function loadTools() {
    if (!user) return;
    setLoading(true);
    const { data } = await api.listAgentTools(user.tenant_id, agent.id);
    if (data) setTools(data);
    setLoading(false);
  }

  async function loadMCPServers() {
    if (!user) return;
    setLoadingServers(true);
    const { data } = await api.listMCPServers();
    if (data && data.length > 0) {
      setMcpServers(data);
    } else {
      // Fallback se o endpoint nao retornar dados
      setMcpServers([
        { id: 'c6bank', name: 'C6 Bank', description: 'PIX, saldo, cobrancas' },
        { id: 'blindpay', name: 'BlindPay', description: 'Payouts, FX, wallets' },
        { id: 'chrome', name: 'Chrome DevTools', description: 'Navegador automatizado' },
        { id: 'postgresql', name: 'PostgreSQL', description: 'Consultas SQL' },
        { id: 'higgsfield', name: 'Higgsfield AI', description: 'Imagens, videos, audio' },
        { id: 'github', name: 'GitHub', description: 'Repos, PRs, issues' },
      ]);
    }
    setLoadingServers(false);
  }

  async function handleAddTool() {
    if (!user || !newToolServer.trim() || !newToolName.trim()) {
      Alert.alert('Atencao', 'Preencha todos os campos'); return;
    }
    setAdding(true);
    const { data, error } = await api.addAgentTool(user.tenant_id, agent.id, {
      name: newToolName.trim(), mcp_server: newToolServer.trim(), mcp_tool: newToolName.trim(),
    });
    setAdding(false);
    if (error) Alert.alert('Erro', error);
    else if (data) { setTools(prev => [...prev, data]); setShowAddModal(false); setNewToolName(''); setNewToolServer(''); }
  }

  async function handleDeleteTool(tool: Tool) {
    if (!user) return;
    Alert.alert('Remover tool', `Deseja remover "${tool.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: async () => {
        const { error } = await api.deleteAgentTool(user.tenant_id, agent.id, tool.id);
        if (error) Alert.alert('Erro', error);
        else setTools(prev => prev.filter(t => t.id !== tool.id));
      }},
    ]);
  }

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={colors.accent} /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MCP Tools</Text>
        <Text style={styles.agentName}>{agent.name}</Text>
      </View>

      <FlatList
        data={tools}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <ShieldIcon size={32} color={colors.textMuted} />
            <Text style={styles.emptyText}>Nenhuma tool configurada</Text>
            <Text style={styles.emptySubtext}>Adicione tools MCP para expandir as capacidades do agente</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.toolCard}>
            <ShieldIcon size={20} color={colors.accent} />
            <View style={styles.toolInfo}>
              <Text style={styles.toolName}>{item.name}</Text>
              <Text style={styles.toolServer}>{item.mcp_server}</Text>
            </View>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteTool(item)}>
              <TrashIcon size={14} color={colors.danger} />
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setShowAddModal(true)}>
        <PlusIcon size={24} color={colors.black} />
      </TouchableOpacity>

      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Adicionar Tool MCP</Text>

            <Text style={styles.label}>Servidor MCP</Text>
            {loadingServers ? (
              <ActivityIndicator size="small" color={colors.accent} style={{ marginVertical: spacing.md }} />
            ) : (
              <View style={styles.serverList}>
                {mcpServers.map(s => (
                  <TouchableOpacity
                    key={s.id}
                    style={[styles.serverChip, newToolServer === s.id && styles.serverChipActive]}
                    onPress={() => setNewToolServer(s.id)}
                  >
                    <Text style={[styles.serverChipText, newToolServer === s.id && styles.serverChipTextActive]}>
                      {s.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.label}>Nome da Tool</Text>
            <TextInput
              style={styles.input}
              value={newToolName}
              onChangeText={setNewToolName}
              placeholder="Ex: consultar_saldo"
              placeholderTextColor={colors.textMuted}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddModal(false)}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, adding && styles.btnDisabled]}
                onPress={handleAddTool} disabled={adding}
              >
                {adding ? <ActivityIndicator size="small" color="#000" /> : <Text style={styles.saveBtnText}>Adicionar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingTop: 56, paddingBottom: spacing.md, paddingHorizontal: spacing.xl,
    backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.cardBorder,
  },
  title: { color: colors.text, fontSize: 22, fontWeight: '700' },
  agentName: { color: colors.textSecondary, fontSize: 14, marginTop: 2 },
  listContent: { padding: spacing.lg, paddingBottom: 100 },
  toolCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card,
    borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.cardBorder, gap: spacing.md,
  },
  toolInfo: { flex: 1 },
  toolName: { color: colors.text, fontSize: 15, fontWeight: '600' },
  toolServer: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  deleteBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: colors.danger + '15',
    justifyContent: 'center', alignItems: 'center',
  },
  empty: { padding: spacing.xxl, alignItems: 'center' },
  emptyText: { color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: spacing.sm, marginTop: spacing.lg },
  emptySubtext: { color: colors.textSecondary, fontSize: 14, textAlign: 'center' },
  fab: {
    position: 'absolute', bottom: 32, right: 24, width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.accent, justifyContent: 'center', alignItems: 'center', elevation: 8,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: spacing.xxl, paddingBottom: spacing.xxl + 20,
  },
  modalHandle: {
    width: 36, height: 4, borderRadius: 2, backgroundColor: colors.cardBorder,
    alignSelf: 'center', marginBottom: spacing.xl,
  },
  modalTitle: { color: colors.text, fontSize: 20, fontWeight: '700', marginBottom: spacing.xl },
  label: { color: colors.textSecondary, fontSize: 13, marginBottom: spacing.sm, marginTop: spacing.md },
  input: {
    backgroundColor: colors.background, borderRadius: borderRadius.md, padding: spacing.lg,
    fontSize: 15, color: colors.text, borderWidth: 1, borderColor: colors.cardBorder,
  },
  serverList: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  serverChip: {
    backgroundColor: colors.background, borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.cardBorder,
  },
  serverChipActive: { backgroundColor: colors.accentMuted, borderColor: colors.accent },
  serverChipText: { color: colors.textSecondary, fontSize: 13 },
  serverChipTextActive: { color: colors.accent },
  modalButtons: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
  saveBtn: { flex: 1, backgroundColor: colors.accent, borderRadius: borderRadius.md, padding: spacing.lg, alignItems: 'center' },
  saveBtnText: { color: '#000', fontSize: 15, fontWeight: '700' },
  cancelBtn: {
    flex: 1, borderRadius: borderRadius.md, padding: spacing.lg, alignItems: 'center',
    borderWidth: 1, borderColor: colors.cardBorder,
  },
  cancelBtnText: { color: colors.textSecondary, fontSize: 15, fontWeight: '600' },
  btnDisabled: { opacity: 0.6 },
});
