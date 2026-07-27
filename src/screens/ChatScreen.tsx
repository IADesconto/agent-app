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
    if (user && agent) {
      loadTools();
    }
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
      `Tem certeza que deseja deletar "${agent.name}"? Esta acao nao pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            const { error } = await api.deleteAgent(user.tenant_id, agent.id);
            if (error) {
              Alert.alert('Erro', error);
            } else {
              navigation.goBack();
            }
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
        const botMessage: IMessage = {
          _id: String(Date.now() + 1),
          text: data.output || 'Processando...',
          createdAt: new Date(),
          user: {
            _id: agent.id,
            name: agent.name,
          },
        };
        setMessages((prev) => GiftedChat.append(prev, [botMessage]));
      } else {
        const errorMessage: IMessage = {
          _id: String(Date.now() + 1),
          text: 'Erro ao processar. Tente novamente.',
          createdAt: new Date(),
          user: {
            _id: 'system',
            name: 'Sistema',
          },
          system: true,
        };
        setMessages((prev) => GiftedChat.append(prev, [errorMessage]));
      }
    },
    [user, agent]
  );

  const renderBubble = (props: any) => (
    <Bubble
      {...props}
      wrapperStyle={{
        left: {
          backgroundColor: colors.card,
          borderRadius: 16,
          borderBottomLeftRadius: 4,
        },
        right: {
          backgroundColor: colors.accent,
          borderRadius: 16,
          borderBottomRightRadius: 4,
        },
      }}
      textStyle={{
        left: { color: colors.text },
        right: { color: '#000' },
      }}
    />
  );

  const renderInputToolbar = (props: any) => (
    <InputToolbar
      {...props}
      containerStyle={{
        backgroundColor: colors.background,
        borderTopColor: colors.cardBorder,
        borderTopWidth: 1,
        paddingHorizontal: 8,
        paddingVertical: 4,
      }}
      primaryStyle={{ alignItems: 'center' }}
      textInputStyle={{
        color: colors.text,
        fontSize: 16,
      }}
    />
  );

  const renderSend = (props: any) => (
    <Send {...props} containerStyle={{ justifyContent: 'center', paddingHorizontal: 8 }}>
      <View style={styles.sendButton}>
        <Text style={{ color: '#000', fontWeight: '700', fontSize: 14 }}>{'>'}</Text>
      </View>
    </Send>
  );

  const renderTypingIndicator = () => (
    typing ? (
      <View style={styles.typingContainer}>
        <ActivityIndicator size="small" color={colors.accent} />
        <Text style={styles.typingText}>{agent.name} esta respondendo...</Text>
      </View>
    ) : null
  );

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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>{'\u2190'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.headerInfo} onPress={() => setShowProfile(true)}>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>
              {AGENT_ICONS[agent.type] || '\u{1F916}'}
            </Text>
          </View>
          <View>
            <Text style={styles.agentName}>{agent.name}</Text>
            <Text style={styles.agentType}>{agent.type} · {agent.model}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleDeleteAgent} style={styles.deleteBtn}>
          <Text style={styles.deleteBtnText}>{'\u{1F5D1}'}</Text>
        </TouchableOpacity>
      </View>

      {/* Typing indicator */}
      {renderTypingIndicator()}

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
            <Text style={styles.emptyChatIcon}>{AGENT_ICONS[agent.type] || '\u{1F916}'}</Text>
            <Text style={styles.emptyChatTitle}>Inicie uma conversa com {agent.name}</Text>
            <Text style={styles.emptyChatSubtitle}>
              Envie uma mensagem para comecar a interagir
            </Text>
          </View>
        )}
      />

      {/* Agent profile modal */}
      <Modal visible={showProfile} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <View style={styles.profileHeader}>
                <View style={styles.profileAvatar}>
                  <Text style={styles.profileAvatarText}>
                    {AGENT_ICONS[agent.type] || '\u{1F916}'}
                  </Text>
                </View>
                <Text style={styles.profileName}>{agent.name}</Text>
                <Text style={styles.profileType}>{agent.type} · {agent.model}</Text>
                <View style={[styles.statusBadge, agent.status === 'active' ? styles.statusActive : styles.statusInactive]}>
                  <Text style={styles.statusText}>{agent.status === 'active' ? 'Ativo' : 'Inativo'}</Text>
                </View>
              </View>

              <View style={styles.profileSection}>
                <Text style={styles.profileSectionTitle}>Tools Ativas ({agentTools.length})</Text>
                {agentTools.length === 0 ? (
                  <Text style={styles.noTools}>Nenhuma tool configurada</Text>
                ) : (
                  agentTools.map((tool: any) => (
                    <View key={tool.id} style={styles.toolItem}>
                      <Text style={styles.toolDot}>{'\u25CF'}</Text>
                      <View>
                        <Text style={styles.toolItemName}>{tool.name}</Text>
                        <Text style={styles.toolItemServer}>{tool.mcp_server}</Text>
                      </View>
                    </View>
                  ))
                )}
              </View>

              <TouchableOpacity
                style={styles.manageToolsBtn}
                onPress={() => {
                  setShowProfile(false);
                  navigation.navigate('MCPTools', { agent });
                }}
              >
                <Text style={styles.manageToolsBtnText}>Gerenciar Tools</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteAgentBtn}
                onPress={() => {
                  setShowProfile(false);
                  setTimeout(() => handleDeleteAgent(), 300);
                }}
              >
                <Text style={styles.deleteAgentBtnText}>Deletar Agente</Text>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setShowProfile(false)}>
              <Text style={styles.closeModalBtnText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: 56,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  backBtn: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  backBtnText: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '600',
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accentMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarText: {
    fontSize: 18,
  },
  agentName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  agentType: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  deleteBtn: {
    padding: spacing.sm,
  },
  deleteBtnText: {
    fontSize: 18,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    gap: spacing.sm,
  },
  typingText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  emptyChat: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
    transform: [{ scaleY: -1 }],
  },
  emptyChatIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  emptyChatTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptyChatSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: borderRadius.xl + 4,
    borderTopRightRadius: borderRadius.xl + 4,
    padding: spacing.xxl,
    maxHeight: '80%',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accentMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  profileAvatarText: {
    fontSize: 32,
  },
  profileName: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  profileType: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  statusBadge: {
    marginTop: spacing.sm,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  statusActive: {
    backgroundColor: colors.accentMuted,
  },
  statusInactive: {
    backgroundColor: colors.cardBorder,
  },
  statusText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  profileSection: {
    marginBottom: spacing.xxl,
  },
  profileSectionTitle: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  noTools: {
    color: colors.textMuted,
    fontSize: 14,
    fontStyle: 'italic',
  },
  toolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  toolDot: {
    color: colors.accent,
    fontSize: 10,
  },
  toolItemName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  toolItemServer: {
    color: colors.textMuted,
    fontSize: 12,
  },
  manageToolsBtn: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  manageToolsBtnText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '700',
  },
  deleteAgentBtn: {
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.danger + '30',
    marginBottom: spacing.lg,
  },
  deleteAgentBtnText: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: '600',
  },
  closeModalBtn: {
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  closeModalBtnText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
});
