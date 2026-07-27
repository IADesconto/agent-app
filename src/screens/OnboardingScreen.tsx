import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { PlanCard, Plan } from '../components/PlanCard';
import { TemplateCard } from '../components/TemplateCard';
import * as api from '../api/client';
import { colors, spacing, borderRadius } from '../theme';

const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 'R$ 600',
    agents: '2 agentes',
    mcp: '2 servidores',
    features: ['Até 2 agentes de IA', '2 MCP servers', 'Suporte por email'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 'R$ 1.000',
    agents: '5 agentes',
    mcp: '5 servidores',
    features: ['Até 5 agentes de IA', '5 MCP servers', 'WhatsApp', 'Suporte prioritario'],
    highlighted: true,
  },
  {
    id: 'business',
    name: 'Business',
    price: 'R$ 2.000',
    agents: '10 agentes',
    mcp: 'Ilimitados',
    features: ['Até 10 agentes de IA', 'MCP ilimitados', 'WhatsApp', 'Suporte dedicado'],
  },
];

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

type Step = 'plan' | 'agents' | 'confirm';

interface OnboardingScreenProps {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const { user, logout } = useAuth();
  const [step, setStep] = useState<Step>('plan');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedAgents, setSelectedAgents] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  function toggleAgent(id: string) {
    setSelectedAgents(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function goToAgents(plan: Plan) {
    setSelectedPlan(plan);
    setStep('agents');
  }

  function goToConfirm() {
    if (selectedAgents.size === 0) {
      Alert.alert('Atencao', 'Selecione pelo menos um agente');
      return;
    }
    setStep('confirm');
  }

  async function handleFinish() {
    if (!user || !selectedPlan) return;
    setLoading(true);

    const ids = Array.from(selectedAgents);
    let failed = 0;
    for (const templateId of ids) {
      const { error } = await api.createAgentFromTemplate(user.tenant_id, templateId);
      if (error) failed++;
    }

    setLoading(false);
    // Marka uma flag local pra indicar que ja fez onboarding
    // O AuthContext vai lidar com a transicao de tela baseado na existencia de agentes
  }

  const planNames: Record<string, string> = {
    starter: 'Starter',
    pro: 'Pro',
    business: 'Business',
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Criando seus agentes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>10ContoAI</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.skipText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Progress */}
      <View style={styles.progress}>
        <View style={[styles.progressDot, styles.progressDotActive]} />
        <View style={styles.progressLine} />
        <View style={[styles.progressDot, (step === 'agents' || step === 'confirm') && styles.progressDotActive]} />
        <View style={styles.progressLine} />
        <View style={[styles.progressDot, step === 'confirm' && styles.progressDotActive]} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {step === 'plan' && (
          <>
            <Text style={styles.title}>Escolha seu plano</Text>
            <Text style={styles.subtitle}>Selecione o plano ideal para voce</Text>

            <View style={styles.plansList}>
              {PLANS.map(plan => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  selected={selectedPlan?.id === plan.id}
                  onPress={goToAgents}
                />
              ))}
            </View>
          </>
        )}

        {step === 'agents' && (
          <>
            <Text style={styles.title}>Escolha seus agentes</Text>
            <Text style={styles.subtitle}>
              Selecione os tipos de agentes que deseja criar
            </Text>

            <View style={styles.agentGrid}>
              {ALL_TEMPLATES.map(t => (
                <TemplateCard
                  key={t.id}
                  id={t.id}
                  name={t.name}
                  description={t.description}
                  selected={selectedAgents.has(t.id)}
                  onPress={toggleAgent}
                />
              ))}
            </View>

            <TouchableOpacity style={styles.button} onPress={goToConfirm}>
              <Text style={styles.buttonText}>
                Continuar ({selectedAgents.size} selecionados)
              </Text>
            </TouchableOpacity>
          </>
        )}

        {step === 'confirm' && (
          <>
            <Text style={styles.title}>Confirmar</Text>
            <Text style={styles.subtitle}>Revise suas escolhas antes de criar</Text>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Plano</Text>
              <Text style={styles.summaryValue}>
                {selectedPlan ? planNames[selectedPlan.id] || selectedPlan.name : ''}
              </Text>

              <Text style={[styles.summaryLabel, { marginTop: spacing.lg }]}>Agentes</Text>
              {Array.from(selectedAgents).map(id => (
                <Text key={id} style={styles.summaryAgent}>
                  {'\u2022'} {ALL_TEMPLATES.find(t => t.id === id)?.name || id}
                </Text>
              ))}
            </View>

            <View style={styles.confirmButtons}>
              <TouchableOpacity style={styles.button} onPress={handleFinish}>
                <Text style={styles.buttonText}>Criar agentes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonOutline} onPress={() => setStep('agents')}>
                <Text style={styles.buttonOutlineText}>Voltar</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: 56,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },
  logo: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.accent,
    letterSpacing: -1,
  },
  skipText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '600',
  },
  progress: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: 0,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.cardBorder,
  },
  progressDotActive: {
    backgroundColor: colors.accent,
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: colors.cardBorder,
    marginHorizontal: 4,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
  },
  plansList: {
    gap: spacing.lg,
  },
  agentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonOutline: {
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.accent,
    marginTop: spacing.md,
  },
  buttonOutlineText: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: spacing.xxl,
  },
  summaryLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: spacing.xs,
  },
  summaryValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  summaryAgent: {
    color: colors.text,
    fontSize: 15,
    marginVertical: 2,
  },
  confirmButtons: {
    gap: spacing.md,
  },
});
