import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Image,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedButton } from '@/components/ThemedButton';
import { EditProfileModal } from '@/components/EditProfileModal';
import { Header } from '@/components/Header';
import Colors from '@/constants/Colors';
import { useThemeColor } from '@/constants/Styles';
import { useTheme } from '@/constants/Theme';
import {
  UserCircle,
  PencilSimple,
  Trash,
  CheckCircle,
  Medal,
  Barbell,
  SwimmingPool,
  PersonSimpleRun,
  Bicycle,
  Target,
  CalendarBlank,
  Timer,
  Lightning,
  Crown,
  Export,
} from 'phosphor-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import {
  getProfile,
  saveProfile,
  deleteAllData,
  getOnboardingData,
  getTestResults,
  Profile,
  TestResults,
} from '@/hooks/useStorage';
import { useRouter, useFocusEffect } from 'expo-router';

const EXPERIENCE_LABELS: Record<string, string> = {
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
};

const EXPERIENCE_COLORS: Record<string, string> = {
  beginner: '#10B981',
  intermediate: '#F59E0B',
  advanced: '#EF4444',
};

function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.round(seconds % 60);
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatSwimPace(testTime: number, testType: '200m' | '400m'): string {
  const distance = testType === '200m' ? 200 : 400;
  const pacePer100 = testTime / (distance / 100);
  const mins = Math.floor(pacePer100 / 60);
  const secs = Math.round(pacePer100 % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}/100m`;
}

function formatRunPace(testTime: number, testType: '3km' | '5km'): string {
  const distance = testType === '3km' ? 3 : 5;
  const pacePerKm = testTime / distance;
  const mins = Math.floor(pacePerKm / 60);
  const secs = Math.round(pacePerKm % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}/km`;
}

function parseRaceDate(dateStr?: string): Date | null {
  if (!dateStr) return null;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  const [day, month, year] = parts.map(Number);
  if (!day || !month || !year) return null;
  const d = new Date(year, month - 1, day);
  if (isNaN(d.getTime())) return null;
  return d;
}

function getDaysUntilRace(dateStr?: string): number | null {
  const raceDate = parseRaceDate(dateStr);
  if (!raceDate) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  raceDate.setHours(0, 0, 0, 0);
  const diff = raceDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getGoalShortName(goal: string): string {
  if (goal.startsWith('Sprint')) return 'Sprint';
  if (goal.startsWith('Standard')) return 'Olímpico';
  if (goal.includes('70.3')) return 'Ironman 70.3';
  if (goal.includes('140.6')) return 'Ironman 140.6';
  if (goal.startsWith('T100')) return 'T100';
  return goal;
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile>({
    name: '',
    age: '',
    gender: 'male',
    height: '',
    weight: '',
    experience: 'beginner',
    trainingGoal: 'Sprint (750m, 20km, 5km)',
    bikeModel: '',
    bikeWeight: '',
  });
  const [testResults, setTestResults] = useState<TestResults>({});
  const [isEditVisible, setIsEditVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const cardBg = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor(
    { light: Colors.shared.neutrals.gray500, dark: Colors.shared.neutrals.gray400 },
    'text'
  );
  const theme = useTheme();
  const router = useRouter();

  const loadData = useCallback(async () => {
    const savedProfile = await getProfile();
    if (savedProfile) {
      setProfile(savedProfile);
    } else {
      const onboardingData = await getOnboardingData();
      if (onboardingData) {
        setProfile(prev => ({
          ...prev,
          weight: onboardingData.weight || prev.weight,
          height: onboardingData.height || prev.height,
          gender: onboardingData.gender || prev.gender,
        }));
      }
    }
    const tests = await getTestResults();
    setTestResults(tests);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handlePhotoSelect = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0].uri) {
      const updated = { ...profile, photo: result.assets[0].uri };
      setProfile(updated);
      await saveProfile(updated);
    }
  };

  const handleSaveProfile = async (updatedProfile: Profile) => {
    setIsSaving(true);
    try {
      const merged = {
        ...updatedProfile,
        photo: profile.photo,
        tests: profile.tests,
        isPremium: profile.isPremium,
      };
      await saveProfile(merged);
      setProfile(merged);
      setIsEditVisible(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (e) {
      console.error('Error saving profile', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Deletar Conta',
      'Tem certeza que deseja deletar sua conta? Esta ação irá remover permanentemente todos os seus dados. Isto não pode ser desfeito.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            setIsDeletingAccount(true);
            try {
              await deleteAllData();
              router.replace('/onboarding/sport');
            } catch (e) {
              console.error('Error deleting account', e);
              Alert.alert('Erro', 'Falha ao deletar conta. Por favor, tente novamente.');
              setIsDeletingAccount(false);
            }
          },
        },
      ]
    );
  };

  const handleExportPDF = async () => {
    try {
      const daysLeft = getDaysUntilRace(profile.raceDate);
      const today = new Date().toLocaleDateString('pt-BR');

      const html = `
        <html>
        <head>
          <meta charset="utf-8" />
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, Helvetica, Arial, sans-serif; padding: 40px; color: #0F172A; }
            .header { text-align: center; margin-bottom: 32px; border-bottom: 3px solid #2563EB; padding-bottom: 24px; }
            .header h1 { font-size: 28px; color: #2563EB; margin-bottom: 4px; }
            .header p { font-size: 13px; color: #64748B; }
            .section { margin-bottom: 28px; }
            .section-title { font-size: 16px; font-weight: 700; color: #2563EB; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px; }
            .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #F1F5F9; }
            .row .label { color: #64748B; font-size: 14px; }
            .row .value { font-weight: 600; font-size: 14px; }
            .card { background: #F8FAFC; border-radius: 10px; padding: 16px; margin-bottom: 12px; }
            .card-title { font-size: 15px; font-weight: 700; margin-bottom: 10px; }
            .metrics { display: flex; gap: 12px; }
            .metric { flex: 1; text-align: center; }
            .metric .val { font-size: 18px; font-weight: 700; }
            .metric .lbl { font-size: 11px; color: #64748B; text-transform: uppercase; }
            .swim .val { color: #0EA5E9; }
            .run .val { color: #F97316; }
            .bike .val { color: #10B981; }
            .race-highlight { background: #2563EB; color: white; border-radius: 10px; padding: 20px; text-align: center; }
            .race-highlight h3 { font-size: 14px; opacity: 0.8; margin-bottom: 6px; }
            .race-highlight .big { font-size: 22px; font-weight: 800; }
            .race-highlight .countdown { margin-top: 10px; font-size: 15px; opacity: 0.9; }
            .footer { text-align: center; margin-top: 32px; font-size: 11px; color: #94A3B8; border-top: 1px solid #E2E8F0; padding-top: 16px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${profile.name || 'Atleta'}</h1>
            <p>Relatório gerado em ${today}</p>
          </div>

          <div class="section">
            <div class="section-title">Dados Pessoais</div>
            ${profile.age ? `<div class="row"><span class="label">Idade</span><span class="value">${profile.age} anos</span></div>` : ''}
            <div class="row"><span class="label">Gênero</span><span class="value">${profile.gender === 'male' ? 'Masculino' : 'Feminino'}</span></div>
            ${profile.height ? `<div class="row"><span class="label">Altura</span><span class="value">${profile.height} cm</span></div>` : ''}
            ${profile.weight ? `<div class="row"><span class="label">Peso</span><span class="value">${profile.weight} kg</span></div>` : ''}
            <div class="row"><span class="label">Nível</span><span class="value">${EXPERIENCE_LABELS[profile.experience] || 'Iniciante'}</span></div>
          </div>

          ${testResults.swim || testResults.run || testResults.bike ? `
          <div class="section">
            <div class="section-title">Performance</div>
            ${testResults.swim ? `
            <div class="card">
              <div class="card-title" style="color:#0EA5E9">🏊 Natação</div>
              <div class="metrics">
                <div class="metric swim"><div class="val">${testResults.swim.testType}</div><div class="lbl">Distância</div></div>
                <div class="metric swim"><div class="val">${formatTime(testResults.swim.testTime)}</div><div class="lbl">Tempo</div></div>
                <div class="metric swim"><div class="val">${formatSwimPace(testResults.swim.testTime, testResults.swim.testType)}</div><div class="lbl">Pace</div></div>
              </div>
            </div>` : ''}
            ${testResults.run ? `
            <div class="card">
              <div class="card-title" style="color:#F97316">🏃 Corrida</div>
              <div class="metrics">
                <div class="metric run"><div class="val">${testResults.run.testType}</div><div class="lbl">Distância</div></div>
                <div class="metric run"><div class="val">${formatTime(testResults.run.testTime)}</div><div class="lbl">Tempo</div></div>
                <div class="metric run"><div class="val">${formatRunPace(testResults.run.testTime, testResults.run.testType)}</div><div class="lbl">Pace</div></div>
              </div>
            </div>` : ''}
            ${testResults.bike ? `
            <div class="card">
              <div class="card-title" style="color:#10B981">🚴 Ciclismo</div>
              <div class="metrics">
                <div class="metric bike"><div class="val">${testResults.bike.testType}</div><div class="lbl">Teste</div></div>
                <div class="metric bike"><div class="val">${testResults.bike.ftp}W</div><div class="lbl">FTP</div></div>
              </div>
            </div>` : ''}
          </div>` : ''}

          ${profile.bikeModel || profile.bikeWeight ? `
          <div class="section">
            <div class="section-title">Equipamento</div>
            ${profile.bikeModel ? `<div class="row"><span class="label">Bicicleta</span><span class="value">${profile.bikeModel}</span></div>` : ''}
            ${profile.bikeWeight ? `<div class="row"><span class="label">Peso da Bike</span><span class="value">${profile.bikeWeight} kg</span></div>` : ''}
          </div>` : ''}

          ${profile.trainingGoal ? `
          <div class="section">
            <div class="section-title">Prova Alvo</div>
            ${profile.raceDate ? `
            <div class="race-highlight">
              <h3>Distância</h3>
              <div class="big">${getGoalShortName(profile.trainingGoal)}</div>
              <div class="countdown">${profile.raceDate}${daysLeft !== null && daysLeft > 0 ? ` • Faltam ${daysLeft} dias` : ''}</div>
            </div>` : `
            <div class="row"><span class="label">Objetivo</span><span class="value">${getGoalShortName(profile.trainingGoal)}</span></div>
            `}
          </div>` : ''}

          <div class="footer">Tri App • Relatório do Atleta</div>
        </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Exportar Dados do Atleta',
        UTI: 'com.adobe.pdf',
      });
    } catch (e) {
      console.error('Error exporting PDF', e);
      Alert.alert('Erro', 'Não foi possível exportar o PDF.');
    }
  };

  // --- Derived values ---
  const daysUntilRace = getDaysUntilRace(profile.raceDate);
  const hasRace = !!profile.raceDate && daysUntilRace !== null;
  const hasPerformanceData = !!(testResults.swim || testResults.run || testResults.bike);

  const renderPerformanceBlock = (
    icon: React.ReactNode,
    label: string,
    color: string,
    metrics: { label: string; value: string }[]
  ) => (
    <View style={[styles.perfBlock, { borderColor }]} key={label}>
      <View style={styles.perfBlockHeader}>
        <View style={[styles.statIconCircle, { backgroundColor: color + '15' }]}>
          {icon}
        </View>
        <ThemedText style={styles.perfBlockTitle} fontFamily="Inter-SemiBold">
          {label}
        </ThemedText>
      </View>
      <View style={styles.perfMetricsRow}>
        {metrics.map((m, i) => (
          <View key={m.label} style={[styles.perfMetricItem, i < metrics.length - 1 && { borderRightWidth: 1, borderRightColor: borderColor }]}>
            <ThemedText style={[styles.perfMetricLabel, { color: mutedColor }]} fontFamily="Inter-Regular">
              {m.label}
            </ThemedText>
            <ThemedText style={[styles.perfMetricValue, { color }]} fontFamily="Inter-Bold">
              {m.value}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Header title="Perfil" color={Colors.shared.primary} />

        {/* ─── AVATAR / IDENTITY ─── */}
        <View style={styles.identitySection}>
          <TouchableOpacity onPress={handlePhotoSelect} activeOpacity={0.8}>
            <View style={[styles.avatarRing, { borderColor: Colors.shared.primary }]}>
              {profile.photo ? (
                <Image source={{ uri: profile.photo }} style={styles.avatarImage} />
              ) : (
                <UserCircle size={56} color={Colors.shared.primary} weight="thin" />
              )}
              <View style={[styles.avatarEditBadge, { backgroundColor: Colors.shared.primary }]}>
                <PencilSimple size={12} color="#fff" weight="bold" />
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.identityInfo}>
            {profile.name ? (
              <ThemedText style={styles.userName} fontFamily="Inter-Bold">
                {profile.name}
              </ThemedText>
            ) : (
              <ThemedText style={[styles.userName, { color: mutedColor }]} fontFamily="Inter-Medium">
                Seu Nome
              </ThemedText>
            )}

            <View style={styles.badgeRow}>
              {profile.isPremium && (
                <View style={[styles.badge, { backgroundColor: '#FBBF24' + '25' }]}>
                  <Crown size={12} color="#FBBF24" weight="fill" />
                  <ThemedText style={[styles.badgeText, { color: '#FBBF24' }]} fontFamily="Inter-SemiBold">
                    Premium
                  </ThemedText>
                </View>
              )}
              <View
                style={[
                  styles.badge,
                  { backgroundColor: EXPERIENCE_COLORS[profile.experience] + '18' },
                ]}
              >
                <ThemedText
                  style={[styles.badgeText, { color: EXPERIENCE_COLORS[profile.experience] }]}
                  fontFamily="Inter-SemiBold"
                >
                  {EXPERIENCE_LABELS[profile.experience] || 'Iniciante'}
                </ThemedText>
              </View>
              <TouchableOpacity
                style={[styles.badge, { backgroundColor: Colors.shared.primary }]}
                onPress={() => setIsEditVisible(true)}
                activeOpacity={0.7}
              >
                <PencilSimple size={12} color="#fff" weight="bold" />
                <ThemedText style={[styles.badgeText, { color: '#fff' }]} fontFamily="Inter-SemiBold">
                  Editar
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.badge, { backgroundColor: Colors.shared.primary }]}
                onPress={handleExportPDF}
                activeOpacity={0.7}
              >
                <Export size={12} color="#fff" weight="bold" />
                <ThemedText style={[styles.badgeText, { color: '#fff' }]} fontFamily="Inter-SemiBold">
                  Exportar
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ─── THEME TOGGLE ─── */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.themeRow}>
            <ThemedText style={{ fontSize: 15 }} fontFamily="Inter-Medium">
              Tema do app
            </ThemedText>
            <Switch
              value={theme.choice === 'dark'}
              onValueChange={(v) => theme.setChoice(v ? 'dark' : 'light')}
              trackColor={{ false: '#767577', true: Colors.shared.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* ─── PERFORMANCE CARD ─── */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.cardHeader}>
            <Lightning size={20} color={Colors.shared.primary} weight="fill" />
            <ThemedText style={styles.cardTitle} fontFamily="Inter-SemiBold">
              Performance
            </ThemedText>
          </View>

          {hasPerformanceData ? (
            <View style={styles.statsGrid}>
              {testResults.swim &&
                renderPerformanceBlock(
                  <SwimmingPool size={20} color={Colors.shared.swim} weight="fill" />,
                  'Natação',
                  Colors.shared.swim,
                  [
                    { label: 'Distância', value: testResults.swim.testType },
                    { label: 'Tempo', value: formatTime(testResults.swim.testTime) },
                    { label: 'Pace', value: formatSwimPace(testResults.swim.testTime, testResults.swim.testType) },
                  ]
                )}
              {testResults.run &&
                renderPerformanceBlock(
                  <PersonSimpleRun size={20} color={Colors.shared.run} weight="fill" />,
                  'Corrida',
                  Colors.shared.run,
                  [
                    { label: 'Distância', value: testResults.run.testType },
                    { label: 'Tempo', value: formatTime(testResults.run.testTime) },
                    { label: 'Pace', value: formatRunPace(testResults.run.testTime, testResults.run.testType) },
                  ]
                )}
              {testResults.bike &&
                renderPerformanceBlock(
                  <Bicycle size={20} color={Colors.shared.bike} weight="fill" />,
                  'Ciclismo',
                  Colors.shared.bike,
                  [
                    { label: 'Teste', value: testResults.bike.testType },
                    { label: 'FTP', value: `${testResults.bike.ftp}W` },
                  ]
                )}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <ThemedText style={[styles.emptyText, { color: mutedColor }]} fontFamily="Inter-Regular">
                Nenhum teste realizado ainda. Faça testes de natação, corrida ou ciclismo para ver seus dados aqui.
              </ThemedText>
            </View>
          )}
        </View>

        {/* ─── TARGET RACE CARD ─── */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: hasRace ? Colors.shared.primary : cardBg,
              borderColor: hasRace ? Colors.shared.primary : borderColor,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <Target size={20} color={hasRace ? '#fff' : Colors.shared.primary} weight="fill" />
            <ThemedText
              style={[styles.cardTitle, hasRace && { color: '#fff' }]}
              fontFamily="Inter-SemiBold"
            >
              Prova Alvo
            </ThemedText>
          </View>

          {hasRace ? (
            <View style={styles.raceContent}>
              <View style={styles.raceInfoRow}>
                <View style={styles.raceInfoItem}>
                  <Medal size={18} color="rgba(255,255,255,0.7)" weight="fill" />
                  <ThemedText style={styles.raceInfoLabel} fontFamily="Inter-Regular">
                    Distância
                  </ThemedText>
                  <ThemedText style={styles.raceInfoValue} fontFamily="Inter-Bold">
                    {getGoalShortName(profile.trainingGoal)}
                  </ThemedText>
                </View>
                <View style={styles.raceInfoDivider} />
                <View style={styles.raceInfoItem}>
                  <CalendarBlank size={18} color="rgba(255,255,255,0.7)" weight="fill" />
                  <ThemedText style={styles.raceInfoLabel} fontFamily="Inter-Regular">
                    Data
                  </ThemedText>
                  <ThemedText style={styles.raceInfoValue} fontFamily="Inter-Bold">
                    {profile.raceDate}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.countdownContainer}>
                <Timer size={20} color="#fff" weight="bold" />
                <ThemedText style={styles.countdownText} fontFamily="Inter-Bold">
                  {daysUntilRace !== null && daysUntilRace > 0
                    ? `Prova em ${daysUntilRace} dias`
                    : daysUntilRace === 0
                    ? 'A prova é hoje! 🎉'
                    : 'Prova já realizada'}
                </ThemedText>
              </View>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <ThemedText style={[styles.emptyText, { color: mutedColor }]} fontFamily="Inter-Regular">
                Defina uma prova alvo para acompanhar a contagem regressiva.
              </ThemedText>
              <ThemedButton
                title="Definir Prova Alvo"
                color={Colors.shared.primary}
                onPress={() => setIsEditVisible(true)}
                containerStyle={{ marginTop: 12 }}
              />
            </View>
          )}
        </View>

        {/* ─── EQUIPMENT CARD ─── */}
        {(profile.bikeModel || profile.bikeWeight) && (
          <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
            <View style={styles.cardHeader}>
              <Bicycle size={20} color={Colors.shared.primary} weight="fill" />
              <ThemedText style={styles.cardTitle} fontFamily="Inter-SemiBold">
                Equipamento
              </ThemedText>
            </View>

            <View style={styles.equipmentRow}>
              {profile.bikeModel ? (
                <View style={styles.equipmentItem}>
                  <ThemedText style={[styles.equipmentLabel, { color: mutedColor }]} fontFamily="Inter-Regular">
                    Bicicleta
                  </ThemedText>
                  <ThemedText style={styles.equipmentValue} fontFamily="Inter-SemiBold">
                    {profile.bikeModel}
                  </ThemedText>
                </View>
              ) : null}
              {profile.bikeWeight ? (
                <View style={styles.equipmentItem}>
                  <ThemedText style={[styles.equipmentLabel, { color: mutedColor }]} fontFamily="Inter-Regular">
                    Peso
                  </ThemedText>
                  <ThemedText style={styles.equipmentValue} fontFamily="Inter-SemiBold">
                    {profile.bikeWeight} kg
                  </ThemedText>
                </View>
              ) : null}
            </View>
          </View>
        )}

        {/* ─── ACTIONS ─── */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.deleteLink}
            onPress={handleDeleteAccount}
            disabled={isDeletingAccount}
          >
            <Trash size={16} color="#EF4444" weight="regular" />
            <ThemedText style={styles.deleteLinkText} fontFamily="Inter-Medium">
              {isDeletingAccount ? 'Deletando Conta...' : 'Deletar Conta'}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ─── EDIT MODAL ─── */}
      <EditProfileModal
        visible={isEditVisible}
        onClose={() => setIsEditVisible(false)}
        onSave={handleSaveProfile}
        profile={profile}
        isLoading={isSaving}
      />

      {/* ─── SUCCESS TOAST ─── */}
      {showToast && (
        <View style={[styles.toast, { backgroundColor: Colors.light.success }]}>
          <CheckCircle color="#fff" size={20} weight="fill" />
          <ThemedText style={styles.toastText}>Perfil salvo com sucesso!</ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  /* Identity / Avatar */
  identitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  avatarRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  identityInfo: {
    flex: 1,
    gap: 6,
  },
  userName: {
    fontSize: 20,
    letterSpacing: -0.3,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
  },
  badgeText: {
    fontSize: 11,
  },

  /* Cards */
  card: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
  },

  /* Theme toggle */
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  /* Performance stats */
  statsGrid: {
    gap: 12,
  },
  perfBlock: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    gap: 12,
  },
  perfBlockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  perfBlockTitle: {
    fontSize: 15,
  },
  statIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  perfMetricsRow: {
    flexDirection: 'row',
  },
  perfMetricItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 4,
  },
  perfMetricLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  perfMetricValue: {
    fontSize: 15,
    letterSpacing: -0.2,
  },

  /* Race card */
  raceContent: {
    gap: 16,
  },
  raceInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  raceInfoItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  raceInfoLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  raceInfoValue: {
    fontSize: 16,
    color: '#fff',
  },
  raceInfoDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  countdownText: {
    color: '#fff',
    fontSize: 15,
  },

  /* Equipment */
  equipmentRow: {
    flexDirection: 'row',
    gap: 24,
  },
  equipmentItem: {
    flex: 1,
    gap: 2,
  },
  equipmentLabel: {
    fontSize: 13,
  },
  equipmentValue: {
    fontSize: 15,
  },

  /* Empty state */
  emptyState: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },

  /* Actions */
  actionsSection: {
    marginTop: 4,
    alignItems: 'center',
  },
  deleteLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  deleteLinkText: {
    fontSize: 14,
    color: '#EF4444',
  },

  /* Toast */
  toast: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  toastText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
});