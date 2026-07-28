import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  FlatList,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { GiftedChat, IMessage, Bubble, InputToolbar, Send } from 'react-native-gifted-chat';
import { useAuth } from '../context/AuthContext';
import {
  getAgentIconComponent,
  MenuIcon,
  PlusIcon,
  TrashIcon,
  SettingsIcon,
  SendIcon,
  ChevronRightIcon,
  XIcon,
  ArrowLeftIcon,
  SparklesIcon,
  BotIcon,
} from '../components/icons';
import * as api from '../api/client';
import { storage } from '../util/storage';
import { colors, spacing, borderRadius } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = Math.min(300, SCREEN_WIDTH * 0.82);

interface Agent {
  id: string;
  name: string;
  type: string;
  model: string;
  status: string;
}

interface Conversation {
  id: string;
  title: string;
  agentId: string;
  agentName: string;
  messages: IMessage[];
  createdAt: number;
}

const CONVERSATIONS_KEY = 'agent_conversations';

export function MainChatScreen({ navigation }: any) {
  const { user } = useAuth();

  const [agents, setAgents] = useState<Agent[]>([]);
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAgentPicker, setShowAgentPicker] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadedConversations, setLoadedConversations] = useState(false);

  const sidebarAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  // Load conversations from storage
  useEffect(() => {
    async function loadConversations() {
      const stored = await storage.getJSON<Conversation[]>(CONVERSATIONS_KEY);
      if (stored && stored.length > 0) {
        // Parse message dates back to Date objects
        const parsed = stored.map((c: any) => ({
          ...c,
          messages: (c.messages || []).map((m: any) => ({
            ...m,
            createdAt: m.createdAt ? new Date(m.createdAt) : new Date(),
          })),
        }));
        setConversations(parsed);
        setActiveConvId(parsed[0].id);
        setActiveAgentId(parsed[0].agentId);
      }
      setLoadedConversations(true);
    }
    loadConversations();
  }, []);

  // Save conversations to storage on change
  useEffect(() => {
    if (loadedConversations && conversations.length > 0) {
      storage.setJSON(CONVERSATIONS_KEY, conversations);
    }
  }, [conversations, loadedConversations]);

  useEffect(() => { if (user) loadAgents(); }, [user]);

  async function loadAgents() {
    if (!user) return;
    setLoading(true);
    const { data } = await api.listAgents(user.tenant_id);
    if (data && data.length > 0) {
      setAgents(data);
      // Only auto-create conversation if no stored conversations exist
      if (!loadedConversations || conversations.length === 0) {
        const firstAgent = data[0];
        setActiveAgentId(firstAgent.id);
        createConversation(firstAgent);
      } else if (!activeAgentId) {
        // Conversations loaded but no active agent set
        setActiveAgentId(conversations[0]?.agentId || data[0].id);
      }
    }
    setLoading(false);
  }

  function createConversation(agent: Agent, existingConvId?: string) {
    const id = existingConvId || `conv_${Date.now()}`;
    const conv: Conversation = {
      id,
      title: `Nova conversa`,
      agentId: agent.id,
      agentName: agent.name,
      messages: [],
      createdAt: Date.now(),
    };
    setConversations(prev => {
      // Update title if reusing
      if (existingConvId) {
        return prev.map(c => c.id === existingConvId ? { ...c } : c);
      }
      return [conv, ...prev];
    });
    setActiveConvId(id);
    setActiveAgentId(agent.id);
    return conv;
  }

  function handleNewChat() {
    const agent = agents.find(a => a.id === activeAgentId) || agents[0];
    if (agent) {
      setSidebarOpen(false);
      createConversation(agent);
    }
  }

  function handleSelectConversation(convId: string) {
    const conv = conversations.find(c => c.id === convId);
    if (conv) {
      setActiveConvId(convId);
      setActiveAgentId(conv.agentId);
      setSidebarOpen(false);
    }
  }

  function handleSelectAgent(agentId: string) {
    const agent = agents.find(a => a.id === agentId);
    if (agent) {
      setActiveAgentId(agentId);
      setShowAgentPicker(false);
      createConversation(agent);
    }
  }

  function handleDeleteConversation(convId: string) {
    Alert.alert('Deletar conversa', 'Esta acao nao pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Deletar',
        style: 'destructive',
        onPress: () => {
          setConversations(prev => prev.filter(c => c.id !== convId));
          if (activeConvId === convId) {
            const remaining = conversations.filter(c => c.id !== convId);
            if (remaining.length > 0) {
              setActiveConvId(remaining[0].id);
              setActiveAgentId(remaining[0].agentId);
            } else if (agents.length > 0) {
              createConversation(agents[0]);
            }
          }
        },
      },
    ]);
  }

  const onSend = useCallback(
    async (newMessages: IMessage[] = []) => {
      if (!user) return;

      const agent = agents.find(a => a.id === activeAgentId);
      if (!agent) return;

      const userMsg = newMessages[0];

      setConversations(prev =>
        prev.map(c => {
          if (c.id !== activeConvId) return c;
          const updated = GiftedChat.append(c.messages, [userMsg]);
          // Auto-title: first 30 chars of first user message
          const title = c.messages.length === 0 && c.title === 'Nova conversa'
            ? (userMsg.text.length > 30 ? userMsg.text.slice(0, 27) + '...' : userMsg.text)
            : c.title;
          return { ...c, messages: updated, title };
        })
      );

      setTyping(true);
      const { data } = await api.runAgent(user.tenant_id, agent.id, userMsg.text);
      setTyping(false);

      if (data) {
        const botMsg: IMessage = {
          _id: String(Date.now() + 1),
          text: data.output || 'Processando...',
          createdAt: new Date(),
          user: { _id: agent.id, name: agent.name },
        };
        setConversations(prev =>
          prev.map(c => c.id === activeConvId ? { ...c, messages: GiftedChat.append(c.messages, [botMsg]) } : c)
        );
      } else {
        const errMsg: IMessage = {
          _id: String(Date.now() + 1),
          text: 'Erro ao processar. Tente novamente.',
          createdAt: new Date(),
          user: { _id: 'system', name: 'Sistema' },
          system: true,
        };
        setConversations(prev =>
          prev.map(c => c.id === activeConvId ? { ...c, messages: GiftedChat.append(c.messages, [errMsg]) } : c)
        );
      }
    },
    [user, activeAgentId, activeConvId, agents, conversations]
  );

  function openSidebar() {
    setSidebarOpen(true);
    Animated.parallel([
      Animated.timing(sidebarAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      Animated.timing(overlayAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  }

  function closeSidebar() {
    Animated.parallel([
      Animated.timing(sidebarAnim, { toValue: -SIDEBAR_WIDTH, duration: 200, useNativeDriver: true }),
      Animated.timing(overlayAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setSidebarOpen(false));
  }

  const activeConv = conversations.find(c => c.id === activeConvId);
  const activeAgent = agents.find(a => a.id === activeAgentId);
  const messages = activeConv?.messages || [];

  const renderBubble = (props: any) => (
    <Bubble
      {...props}
      wrapperStyle={{
        left: { backgroundColor: colors.card, borderTopLeftRadius: 4, borderTopRightRadius: 16, borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
        right: { backgroundColor: colors.primary, borderTopLeftRadius: 16, borderTopRightRadius: 4, borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
      }}
      textStyle={{ left: { color: colors.foreground }, right: { color: colors.primaryForeground } }}
    />
  );

  const renderInputToolbar = (props: any) => (
    <InputToolbar
      {...props}
      containerStyle={{ backgroundColor: colors.background, borderTopColor: colors.border, borderTopWidth: 1, paddingHorizontal: 8, paddingVertical: 4 }}
      primaryStyle={{ alignItems: 'center' }}
      textInputStyle={{ color: colors.foreground, fontSize: 16 }}
    />
  );

  const renderSend = (props: any) => (
    <Send {...props} containerStyle={{ justifyContent: 'center', paddingHorizontal: 8 }}>
      <View style={styles.sendButton}>
        <SendIcon size={16} color={colors.primaryForeground} />
      </View>
    </Send>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Sidebar overlay */}
      {sidebarOpen && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={closeSidebar}
        >
          <Animated.View style={[styles.overlayBg, { opacity: overlayAnim }]} />
        </TouchableOpacity>
      )}

      {/* Sidebar */}
      <Animated.View style={[styles.sidebar, { transform: [{ translateX: sidebarAnim }] }]}>
        <View style={styles.sidebarHeader}>
          <Text style={styles.sidebarTitle}>
            10Conto<Text style={{ color: colors.primary }}>AI</Text>
          </Text>
          <TouchableOpacity onPress={closeSidebar}>
            <XIcon size={20} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        {/* New Chat */}
        <TouchableOpacity style={styles.newChatBtn} onPress={handleNewChat}>
          <PlusIcon size={16} color={colors.primaryForeground} />
          <Text style={styles.newChatText}>Nova conversa</Text>
        </TouchableOpacity>

        {/* Active Agent selector in sidebar */}
        <View style={styles.sidebarSection}>
          <Text style={styles.sidebarSectionTitle}>Agente ativo</Text>
          <TouchableOpacity
            style={styles.agentSelector}
            onPress={() => { setSidebarOpen(false); setShowAgentPicker(true); }}
          >
            <View style={styles.agentSelectorIcon}>
              {activeAgent ? getAgentIconComponent(activeAgent.name, 18) : <BotIcon size={18} color={colors.primary} />}
            </View>
            <Text style={styles.agentSelectorName} numberOfLines={1}>
              {activeAgent?.name || 'Selecionar agente'}
            </Text>
            <ChevronRightIcon size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        {/* Conversations */}
        <View style={styles.sidebarSection}>
          <Text style={styles.sidebarSectionTitle}>Historico</Text>
        </View>
        <FlatList
          data={conversations}
          keyExtractor={item => item.id}
          style={styles.convList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.convItem, item.id === activeConvId && styles.convItemActive]}
              onPress={() => handleSelectConversation(item.id)}
              onLongPress={() => handleDeleteConversation(item.id)}
            >
              <View style={styles.convAvatar}>
                {getAgentIconComponent(item.agentName, 14)}
              </View>
              <View style={styles.convInfo}>
                <Text style={styles.convTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.convMeta} numberOfLines={1}>
                  {item.agentName} · {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.convDelete}
                onPress={() => handleDeleteConversation(item.id)}
              >
                <TrashIcon size={14} color={colors.mutedForeground} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyHistory}>Nenhuma conversa ainda</Text>
          }
        />

        {/* Bottom nav */}
        <View style={styles.sidebarFooter}>
          <TouchableOpacity
            style={styles.sidebarFooterItem}
            onPress={() => { closeSidebar(); navigation.navigate('Profile'); }}
          >
            <SettingsIcon size={18} color={colors.mutedForeground} />
            <Text style={styles.sidebarFooterText}>Configuracoes</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Main Chat Area */}
      <View style={styles.mainArea}>
        {/* Chat header */}
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={openSidebar} style={styles.headerBtn}>
            <MenuIcon size={22} color={colors.foreground} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.headerCenter} onPress={() => setShowAgentPicker(true)}>
            <View style={styles.headerAvatar}>
              {activeAgent ? getAgentIconComponent(activeAgent.name, 16) : <BotIcon size={16} color={colors.primary} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerAgentName} numberOfLines={1}>
                {activeAgent?.name || 'Selecionar agente'}
              </Text>
              <Text style={styles.headerModel}>{activeAgent?.model || ''}</Text>
            </View>
            <ChevronRightIcon size={14} color={colors.mutedForeground} />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleNewChat} style={[styles.headerBtn, styles.newBtn]}>
            <PlusIcon size={18} color={colors.primaryForeground} />
          </TouchableOpacity>
        </View>

        {/* Typing indicator */}
        {typing && (
          <View style={styles.typingBar}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.typingText}>{activeAgent?.name} respondendo...</Text>
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
          timeTextStyle={{ left: { color: colors.mutedForeground }, right: { color: colors.primaryForeground } }}
          renderChatEmpty={() => (
            <View style={styles.emptyChat}>
              <View style={styles.emptyIconWrap}>
                {activeAgent
                  ? getAgentIconComponent(activeAgent.name, 32)
                  : <SparklesIcon size={32} color={colors.primary} />
                }
              </View>
              <Text style={styles.emptyTitle}>
                {activeAgent ? `Ola! Eu sou ${activeAgent.name}` : 'Selecione um agente'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {activeAgent
                  ? 'Como posso ajudar voce hoje?'
                  : 'Escolha um agente para comecar a conversar'
                }
              </Text>
            </View>
          )}
        />
      </View>

      {/* Agent Picker Modal */}
      <Modal visible={showAgentPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Selecionar agente</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {agents.map(agent => (
                <TouchableOpacity
                  key={agent.id}
                  style={[styles.agentItem, agent.id === activeAgentId && styles.agentItemActive]}
                  onPress={() => handleSelectAgent(agent.id)}
                >
                  <View style={styles.agentItemIcon}>
                    {getAgentIconComponent(agent.name, 20)}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.agentItemName}>{agent.name}</Text>
                    <Text style={styles.agentItemModel}>{agent.model}</Text>
                  </View>
                  <View style={[styles.agentItemDot, (agent.status === 'active' || agent.status === 'idle') && styles.agentItemDotActive]} />
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowAgentPicker(false)}>
              <Text style={styles.closeBtnText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', backgroundColor: colors.background },
  centered: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },

  // Sidebar
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 5 },
  overlayBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sidebar: {
    position: 'absolute', top: 0, left: 0, bottom: 0, width: SIDEBAR_WIDTH,
    backgroundColor: colors.popover, zIndex: 10, borderRightWidth: 1, borderRightColor: colors.border,
  },
  sidebarHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 56, paddingHorizontal: spacing.lg, paddingBottom: spacing.md,
  },
  sidebarTitle: { color: colors.foreground, fontSize: 20, fontWeight: '700' },
  newChatBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary,
    borderRadius: borderRadius.md, marginHorizontal: spacing.md, padding: spacing.md,
    marginBottom: spacing.lg, gap: spacing.sm, justifyContent: 'center',
  },
  newChatText: { color: colors.primaryForeground, fontSize: 14, fontWeight: '700' },
  sidebarSection: { paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  sidebarSectionTitle: {
    color: colors.mutedForeground, fontSize: 11, fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm,
  },
  agentSelector: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card,
    borderRadius: borderRadius.md, padding: spacing.md, gap: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  agentSelectorIcon: {
    width: 30, height: 30, borderRadius: 8, backgroundColor: colors.muted,
    justifyContent: 'center', alignItems: 'center',
  },
  agentSelectorName: { flex: 1, color: colors.foreground, fontSize: 14, fontWeight: '600' },
  convList: { flex: 1 },
  convItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md,
    paddingHorizontal: spacing.md, gap: spacing.sm, borderRadius: borderRadius.sm,
    marginHorizontal: spacing.xs,
  },
  convItemActive: { backgroundColor: colors.muted },
  convAvatar: {
    width: 28, height: 28, borderRadius: 8, backgroundColor: colors.muted,
    justifyContent: 'center', alignItems: 'center',
  },
  convInfo: { flex: 1 },
  convTitle: { color: colors.foreground, fontSize: 14, fontWeight: '500' },
  convMeta: { color: colors.mutedForeground, fontSize: 11, marginTop: 2 },
  convDelete: { padding: 4 },
  emptyHistory: { color: colors.mutedForeground, fontSize: 13, padding: spacing.lg, textAlign: 'center' },
  sidebarFooter: {
    borderTopWidth: 1, borderTopColor: colors.border, padding: spacing.md,
  },
  sidebarFooterItem: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm,
  },
  sidebarFooterText: { color: colors.mutedForeground, fontSize: 14 },

  // Main Chat
  mainArea: { flex: 1 },
  chatHeader: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm,
    paddingTop: 56, paddingBottom: spacing.sm, backgroundColor: colors.background,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  newBtn: { backgroundColor: colors.primary },
  headerCenter: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.card, borderRadius: borderRadius.md,
    padding: spacing.sm, gap: spacing.sm, borderWidth: 1, borderColor: colors.border,
  },
  headerAvatar: {
    width: 30, height: 30, borderRadius: 8, backgroundColor: colors.muted,
    justifyContent: 'center', alignItems: 'center',
  },
  headerAgentName: { color: colors.foreground, fontSize: 14, fontWeight: '700' },
  headerModel: { color: colors.mutedForeground, fontSize: 10 },
  typingBar: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm, backgroundColor: colors.background, gap: spacing.sm,
  },
  typingText: { color: colors.mutedForeground, fontSize: 12 },
  sendButton: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  emptyChat: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    padding: spacing.xxl, transform: [{ scaleY: -1 }],
  },
  emptyIconWrap: {
    width: 72, height: 72, borderRadius: 18, backgroundColor: colors.muted,
    justifyContent: 'center', alignItems: 'center', marginBottom: spacing.lg,
  },
  emptyTitle: { color: colors.foreground, fontSize: 20, fontWeight: '700', textAlign: 'center' },
  emptySubtitle: { color: colors.mutedForeground, fontSize: 14, textAlign: 'center', marginTop: 6, lineHeight: 20 },

  // Agent picker modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: spacing.xxl, maxHeight: '60%',
  },
  modalHandle: {
    width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border,
    alignSelf: 'center', marginBottom: spacing.xl,
  },
  modalTitle: { color: colors.foreground, fontSize: 18, fontWeight: '700', marginBottom: spacing.lg },
  agentItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background,
    borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border, gap: spacing.md,
  },
  agentItemActive: { borderColor: colors.primary, backgroundColor: colors.muted },
  agentItemIcon: {
    width: 40, height: 40, borderRadius: 10, backgroundColor: colors.muted,
    justifyContent: 'center', alignItems: 'center',
  },
  agentItemName: { color: colors.foreground, fontSize: 15, fontWeight: '600' },
  agentItemModel: { color: colors.mutedForeground, fontSize: 12, marginTop: 1 },
  agentItemDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.mutedForeground },
  agentItemDotActive: { backgroundColor: colors.success },
  closeBtn: {
    borderRadius: borderRadius.md, padding: spacing.lg, alignItems: 'center',
    marginTop: spacing.md, borderWidth: 1, borderColor: colors.border,
  },
  closeBtnText: { color: colors.mutedForeground, fontSize: 15, fontWeight: '600' },
});
