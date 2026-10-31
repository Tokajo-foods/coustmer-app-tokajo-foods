import { useRouter } from 'expo-router';
import { ArrowLeft, ChevronRight, FileText, Lock, MessageSquareWarning, RotateCcw } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { authTheme } from '@/constants/auth-theme';
import { LEGAL_DOCUMENTS, type LegalSlug } from '@/lib/legal';
import { LEGAL_CONTACT } from '@/lib/legal/contact';

import { legalStyles as s } from './legal-styles';

const ICONS: Record<LegalSlug, typeof FileText> = {
  terms: FileText,
  privacy: Lock,
  refunds: RotateCcw,
  grievance: MessageSquareWarning,
};

export function LegalIndexScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.backBtn} hitSlop={10} accessibilityLabel="Go back">
          <ArrowLeft size={22} color="#0B1220" />
        </Pressable>
        <Text style={s.headerTitle}>Legal, Terms & Conditions</Text>
      </View>

      <ScrollView contentContainerStyle={[s.indexBody, { paddingBottom: insets.bottom + 32 }]}>
        <Text style={s.intro}>
          These documents explain how {LEGAL_CONTACT.app} works, how we handle your data and what to do if something
          goes wrong.
        </Text>
        <View style={s.card}>
          {LEGAL_DOCUMENTS.map((doc, i) => {
            const Icon = ICONS[doc.slug];
            return (
              <Pressable
                key={doc.slug}
                style={[s.docRow, i > 0 && s.docRowBorder]}
                onPress={() => router.push({ pathname: '/support/legal/[doc]', params: { doc: doc.slug } })}
                accessibilityRole="button"
              >
                <View style={s.docIcon}>
                  <Icon size={18} color={authTheme.brand} strokeWidth={2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.docTitle}>{doc.title}</Text>
                  <Text style={s.docSummary}>{doc.summary}</Text>
                </View>
                <ChevronRight size={18} color="#9CA3AF" />
              </Pressable>
            );
          })}
        </View>
        <Text style={s.footnote}>
          Questions? Write to {LEGAL_CONTACT.supportEmail}
        </Text>
      </ScrollView>
    </View>
  );
}
