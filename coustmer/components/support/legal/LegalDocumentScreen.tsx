import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { findLegalDocument } from '@/lib/legal';

import { legalStyles as s } from './legal-styles';

export function LegalDocumentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { doc: slug } = useLocalSearchParams<{ doc?: string }>();
  const doc = findLegalDocument(Array.isArray(slug) ? slug[0] : slug);

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.backBtn} hitSlop={10} accessibilityLabel="Go back">
          <ArrowLeft size={22} color="#0B1220" />
        </Pressable>
        <Text style={s.headerTitle} numberOfLines={1}>{doc?.title ?? 'Legal'}</Text>
      </View>

      {!doc ? (
        <View style={s.missing}>
          <Text style={s.missingText}>This document could not be found.</Text>
          <Pressable onPress={() => router.replace('/support/legal')} style={s.missingBtn}>
            <Text style={s.missingBtnText}>See all documents</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={[s.docBody, { paddingBottom: insets.bottom + 40 }]}>
          <Text style={s.docHeading}>{doc.title}</Text>
          <Text style={s.updated}>Last updated: {doc.updated}</Text>
          {doc.sections.map((section) => (
            <View key={section.heading} style={s.section}>
              <Text style={s.sectionHeading}>{section.heading}</Text>
              {section.paragraphs?.map((p) => (
                <Text key={p.slice(0, 48)} style={s.paragraph}>{p}</Text>
              ))}
              {section.bullets?.map((b) => (
                <View key={b.slice(0, 48)} style={s.bulletRow}>
                  <Text style={s.bulletDot}>•</Text>
                  <Text style={s.bulletText}>{b}</Text>
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
