import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { PlanCard, Plan } from '../components/PlanCard';
import { TemplateCard } from '../components/TemplateCard';
import * as api from '../api/client';
import { colors, spacing, borderRadius } from '../theme';

interface Template {
  id: string;
  name: string;
  description: string;
}

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
  const [templates, setTemplates] = useState<Template[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [plansRes, templatesRes] = await Promise.all([
        api.listPlans(),
        api.listTemplates(),
      ]);
      if (plansRes.data) {
        setPlans(plansRes.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price_display || `R$ ${p.price_monthly || p.price}`,
          agents: p.agent_limit ? `${p.agent_limit} agentes` : 'Ilimitados',
          mcp: p.mcp_limit ? `${p.mcp_limit} servidores` : 'Ilimitados',
          features: p.features || [],
          highlighted: p.highlighted || p.name === 'Pro',
        })));
      }
      if (templatesRes.data) setTemplates(templatesRes.data);
      setLoadingData(false);
    }
    loadData();
  }, []);

  function toggleAgent(id: string) {
    setSelectedAgents(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
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

    const { error } = await api.completeOnboarding(user.tenant_id, {
      plan_id: selectedPlan.id,
      selected_templates: Array.from(selectedAgents),
    });

    setLoading(false);

    if (error) {
      // Fallback: create agentes manualmente
      let failed = 0;
      for (const templateId of Array.from(selectedAgents)) {
        const res = await api.createAgentFromTemplate(user.tenant_id, templateId);
        if (res.error) failed++;
      }
    }

    onComplete();
  }

  const planNames: Record<string, string> = {};

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Criando seus agentes...</Text>
      </View>
    );
  }

  if (loadingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>10ContoAI</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.skipText}>Sair</Text>
        </TouchableOpacity>
      </View>

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
              {plans.map(plan => (
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
            <Text style={styles.subtitle}>Selecione os tipos de agentes que deseja criar</Text>

            <View style={styles.agentGrid}>
              {templates.map(t => (
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
              <Text style={styles.summaryValue}>{selectedPlan?.name || ''}</Text>
              <Text style={[styles.summaryLabel, { marginTop: spacing.lg }]}>Agentes</Text>
              {Array.from(selectedAgents).map(id => (
                <Text key={id} style={styles.summaryAgent}>
                  {'\u2022'} {templates.find(t => t.id === id)?.name || id}
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
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: colors.textSecondary, fontSize: 16, marginTop: spacing.lg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.xl, paddingTop: 56, paddingBottom: spacing.md, backgroundColor: colors.background,
  },
  logo: { fontSize: 24, fontWeight: '800', color: colors.accent, letterSpacing: -1 },
  skipText: { color: colors.danger, fontSize: 14, fontWeight: '600' },
  progress: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.lg },
  progressDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.cardBorder },
  progressDotActive: { backgroundColor: colors.accent },
  progressLine: { width: 40, height: 2, backgroundColor: colors.cardBorder, marginHorizontal: 4 },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  title: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  subtitle: { fontSize: 15, color: colors.textSecondary, marginBottom: spacing.xxl },
  plansList: { gap: spacing.lg },
  agentGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, justifyContent: 'center', marginBottom: spacing.xxl },
  button: { backgroundColor: colors.accent, borderRadius: borderRadius.md, padding: spacing.lg, alignItems: 'center' },
  buttonText: { color: '#000', fontSize: 16, fontWeight: '700' },
  buttonOutline: {
    borderRadius: borderRadius.md, padding: spacing.lg, alignItems: 'center',
    borderWidth: 1, borderColor: colors.accent, marginTop: spacing.md,
  },
  buttonOutlineText: { color: colors.accent, fontSize: 16, fontWeight: '600' },
  summaryCard: {
    backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.xl,
    borderWidth: 1, borderColor: colors.cardBorder, marginBottom: spacing.xxl,
  },
  summaryLabel: { color: colors.textSecondary, fontSize: 13, marginBottom: spacing.xs },
  summaryValue: { color: colors.text, fontSize: 18, fontWeight: '700' },
  summaryAgent: { color: colors.text, fontSize: 15, marginVertical: 2 },
  confirmButtons: { gap: spacing.md },
});
