import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { GiftedChat, IMessage, Bubble, InputToolbar, Send } from 'react-native-gifted-chat';
import { useAuth } from '../context/AuthContext';
import {
  getAgentIconComponent,
  ArrowLeftIcon,
  TrashIcon,
  SettingsIcon,
  PlusIcon,
  SendIcon,
  ChevronRightIcon,
  XIcon,
} from '../components/icons';
import * as api from '../api/client';
import { colors, spacing, borderRadius } from '../theme';

interface Agent {
  id: string;
  name: string;
  type: string;
  model: string;
  status: string;
}

export function ChatScreen({ route, navigation }: any) {
  const { user } = useAuth();
  const agent: Agent = route.params.agent;

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [typing, setTyping] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [agentTools, setAgentTools] = useState<any[]>([]);

  useEffect(() => {
    if (user && agent) loadTools();
  }, [user, agent?.id]);

  async function loadTools() {
    if (!user) return;
    const { data } = await api.listAgentTools(user.tenant_id, agent.id);
    if (data) setAgentTools(data);
  }

  async function handleDeleteAgent() {
    if (!user) return;
    Alert.alert(
      'Deletar agente',
      `Tem certeza que deseja deletar "${agent.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            const { error } = await api.deleteAgent(user.tenant_id, agent.id);
            if (error) Alert.alert('Erro', error);
            else navigation.goBack();
          },
        },
      ]
    );
  }

  const onSend = useCallback(
    async (newMessages: IMessage[] = []) => {
      if (!user || !agent) return;
      const userMessage = newMessages[0];
      setMessages((prev) => GiftedChat.append(prev, [userMessage]));
      setTyping(true);
      const { data } = await api.runAgent(user.tenant_id, agent.id, userMessage.text);
      setTyping(false);
      if (data) {
        setMessages((prev) =>
          GiftedChat.append(prev, [
            { _id: String(Date.now() + 1), text: data.output || 'Processando...', createdAt: new Date(), user: { _id: agent.id, name: agent.name } },
          ])
        );
      } else {
        setMessages((prev) =>
          GiftedChat.append(prev, [
            { _id: String(Date.now() + 1), text: 'Erro ao processar.', createdAt: new Date(), user: { _id: 'system', name: 'Sistema' }, system: true },
          ])
        );
      }
    },
    [user, agent]
  );

  const renderBubble = (props: any) => (
    <Bubble
      {...props}
      wrapperStyle={{
        left: { backgroundColor: colors.card, borderRadius: 16, borderBottomLeftRadius: 4 },
        right: { backgroundColor: colors.accent, borderRadius: 16, borderBottomRightRadius: 4 },
      }}
      textStyle={{ left: { color: colors.text }, right: { color: '#000' } }}
    />
  );

  const renderInputToolbar = (props: any) => (
    <InputToolbar
      {...props}
      containerStyle={{ backgroundColor: colors.background, borderTopColor: colors.cardBorder, borderTopWidth: 1, paddingHorizontal: 8, paddingVertical: 4 }}
      primaryStyle={{ alignItems: 'center' }}
      textInputStyle={{ color: colors.text, fontSize: 16 }}
    />
  );

  const renderSend = (props: any) => (
    <Send {...props} containerStyle={{ justifyContent: 'center', paddingHorizontal: 8 }}>
      <View style={styles.sendButton}>
        <SendIcon size={16} color={colors.black} />
      </View>
    </Send>
  );

  const isActive = agent.status === 'active' || agent.status === 'idle';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <ArrowLeftIcon size={22} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.headerInfo} onPress={() => setShowProfile(true)}>
          <View style={styles.headerAvatar}>
            {getAgentIconComponent(agent.name, 18)}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.agentName} numberOfLines={1}>{agent.name}</Text>
            <View style={styles.headerMeta}>
              <View style={[styles.miniDot, isActive && styles.miniDotActive]} />
              <Text style={styles.agentType}>{agent.model}</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleDeleteAgent} style={styles.headerBtn}>
          <TrashIcon size={18} color={colors.danger} />
        </TouchableOpacity>
      </View>

      {/* Typing indicator */}
      {typing && (
        <View style={styles.typingContainer}>
          <ActivityIndicator size="small" color={colors.accent} />
          <Text style={styles.typingText}>{agent.name} esta respondendo...</Text>
        </View>
      )}

      {/* Chat */}
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{ _id: user?.user_id || 'me', name: 'Voce' }}
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar}
        renderSend={renderSend}
        timeTextStyle={{ left: { color: colors.textMuted }, right: { color: colors.textMuted } }}
        renderChatEmpty={() => (
          <View style={styles.emptyChat}>
            <View style={styles.emptyIconWrap}>
              {getAgentIconComponent(agent.name, 28)}
            </View>
            <Text style={styles.emptyChatTitle}>Inicie uma conversa</Text>
            <Text style={styles.emptyChatSubtitle}>com {agent.name}</Text>
          </View>
        )}
      />

      {/* Agent profile modal */}
      <Modal visible={showProfile} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.profileHeader}>
                <View style={styles.profileAvatarWrap}>
                  {getAgentIconComponent(agent.name, 28)}
                </View>
                <Text style={styles.profileName}>{agent.name}</Text>
                <Text style={styles.profileModel}>{agent.model}</Text>
                <View style={[styles.statusBadge, isActive ? styles.statusActive : styles.statusInactive]}>
                  <View style={[styles.statusBadgeDot, isActive && styles.statusBadgeDotActive]} />
                  <Text style={[styles.statusText, isActive && styles.statusTextActive]}>
                    {isActive ? 'Online' : 'Offline'}
                  </Text>
                </View>
              </View>

              <View style={styles.profileSection}>
                <Text style={styles.sectionTitle}>Tools ativas ({agentTools.length})</Text>
                {agentTools.length === 0 ? (
                  <Text style={styles.noData}>Nenhuma tool configurada</Text>
                ) : (
                  agentTools.map((tool: any) => (
                    <View key={tool.id} style={styles.toolItem}>
                      <Text style={styles.toolDot}>{'\u25CF'}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.toolItemName}>{tool.name}</Text>
                        <Text style={styles.toolItemServer}>{tool.mcp_server}</Text>
                      </View>
                    </View>
                  ))
                )}
              </View>

              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => { setShowProfile(false); navigation.navigate('MCPTools', { agent }); }}
              >
                <SettingsIcon size={18} color={colors.text} />
                <Text style={styles.actionBtnText}>Gerenciar Tools</Text>
                <ChevronRightIcon size={18} color={colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnDanger]}
                onPress={() => { setShowProfile(false); setTimeout(() => handleDeleteAgent(), 300); }}
              >
                <TrashIcon size={18} color={colors.danger} />
                <Text style={styles.actionBtnTextDanger}>Deletar Agente</Text>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowProfile(false)}>
              <XIcon size={18} color={colors.textSecondary} />
              <Text style={styles.closeBtnText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md,
    paddingTop: 56, paddingBottom: spacing.md, backgroundColor: colors.background,
    borderBottomWidth: 1, borderBottomColor: colors.cardBorder,
  },
  headerBtn: { padding: spacing.sm, marginRight: 4 },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerAvatar: {
    width: 36, height: 36, borderRadius: 12, backgroundColor: colors.accentMuted,
    justifyContent: 'center', alignItems: 'center',
  },
  agentName: { color: colors.text, fontSize: 16, fontWeight: '700' },
  headerMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 },
  miniDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.textMuted },
  miniDotActive: { backgroundColor: colors.accent },
  agentType: { color: colors.textMuted, fontSize: 11 },
  typingContainer: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm, backgroundColor: colors.background, gap: spacing.sm,
  },
  typingText: { color: colors.textSecondary, fontSize: 12 },
  sendButton: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: colors.accent,
    justifyContent: 'center', alignItems: 'center',
  },
  emptyChat: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xxl, transform: [{ scaleY: -1 }],
  },
  emptyIconWrap: {
    width: 64, height: 64, borderRadius: 18, backgroundColor: colors.accentMuted,
    justifyContent: 'center', alignItems: 'center', marginBottom: spacing.lg,
  },
  emptyChatTitle: { color: colors.text, fontSize: 18, fontWeight: '600', textAlign: 'center' },
  emptyChatSubtitle: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 4 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: spacing.xxl, maxHeight: '82%',
  },
  modalHandle: {
    width: 36, height: 4, borderRadius: 2, backgroundColor: colors.cardBorder,
    alignSelf: 'center', marginBottom: spacing.xl,
  },
  profileHeader: { alignItems: 'center', marginBottom: spacing.xxl },
  profileAvatarWrap: {
    width: 64, height: 64, borderRadius: 18, backgroundColor: colors.accentMuted,
    justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md,
  },
  profileName: { color: colors.text, fontSize: 20, fontWeight: '700' },
  profileModel: { color: colors.textSecondary, fontSize: 14, marginTop: 4 },
  statusBadge: {
    marginTop: spacing.sm, borderRadius: borderRadius.full, paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs, flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  statusActive: { backgroundColor: colors.accentMuted },
  statusInactive: { backgroundColor: colors.cardBorder },
  statusBadgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.textMuted },
  statusBadgeDotActive: { backgroundColor: colors.accent },
  statusText: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  statusTextActive: { color: colors.accent },
  profileSection: { marginBottom: spacing.xxl },
  sectionTitle: {
    color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: spacing.md,
    textTransform: 'uppercase', letterSpacing: 1,
  },
  noData: { color: colors.textMuted, fontSize: 14 },
  toolItem: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.sm },
  toolDot: { color: colors.accent, fontSize: 10, marginTop: 4 },
  toolItemName: { color: colors.text, fontSize: 14, fontWeight: '500' },
  toolItemServer: { color: colors.textMuted, fontSize: 12 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cardHover,
    borderRadius: borderRadius.md, padding: spacing.lg, marginBottom: spacing.sm, gap: spacing.md,
  },
  actionBtnDanger: { backgroundColor: colors.danger + '10' },
  actionBtnText: { flex: 1, color: colors.text, fontSize: 15, fontWeight: '600' },
  actionBtnTextDanger: { flex: 1, color: colors.danger, fontSize: 15, fontWeight: '600' },
  closeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: borderRadius.md, padding: spacing.lg, marginTop: spacing.md,
    borderWidth: 1, borderColor: colors.cardBorder, gap: spacing.sm,
  },
  closeBtnText: { color: colors.textSecondary, fontSize: 15, fontWeight: '600' },
});
