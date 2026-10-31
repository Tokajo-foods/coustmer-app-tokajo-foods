import { useRouter, type Href } from 'expo-router';
import { ArrowLeft, MessageCircle, Search, X } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { authTheme } from '@/constants/auth-theme';
import { getApiErrorMessage } from '@/lib/errors';
import { useSupportFaqs } from '@/lib/support/support-hooks';
import type { FaqItem } from '@/lib/support/types';

import { FaqCard } from './FaqCard';
import { faqStyles as s } from './faq-styles';

const CATEGORIES: { id: string; label: string }[] = [
  { id: 'orders', label: 'Orders' },
  { id: 'payments', label: 'Payments & refunds' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'account', label: 'Account' },
  { id: 'restaurant', label: 'Restaurants' },
  { id: 'other', label: 'Other' },
];
const labelFor = (id?: string) => CATEGORIES.find((c) => c.id === id)?.label ?? 'General';

export function FaqScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const faqs = useSupportFaqs();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const toggle = useCallback((id: string) => setOpenId((cur) => (cur === id ? null : id)), []);

  const all = useMemo(() => faqs.data ?? [], [faqs.data]);
  const present = useMemo(() => CATEGORIES.filter((c) => all.some((f) => f.category === c.id)), [all]);

  const sections = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = all.filter(
      (f) =>
        (!category || f.category === category) &&
        (!q || `${f.question} ${f.answer ?? ''} ${f.answerPreview ?? ''}`.toLowerCase().includes(q)),
    );
    const map = new Map<string, FaqItem[]>();
    for (const f of rows) {
      const key = labelFor(f.category);
      map.set(key, [...(map.get(key) ?? []), f]);
    }
    return [...map.entries()].map(([title, items]) => ({ title, items }));
  }, [all, category, search]);

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.backBtn} hitSlop={10} accessibilityLabel="Go back">
          <ArrowLeft size={22} color="#0B1220" />
        </Pressable>
        <Text style={s.headerTitle}>FAQs</Text>
      </View>

      <View style={s.searchWrap}>
        <Search size={16} color="#9CA3AF" strokeWidth={2} />
        <TextInput style={s.searchInput} placeholder="Search for a question" placeholderTextColor="#9CA3AF"
          value={search} onChangeText={setSearch} returnKeyType="search" />
        {search ? (
          <Pressable onPress={() => setSearch('')} hitSlop={10} accessibilityLabel="Clear search">
            <X size={16} color="#9CA3AF" />
          </Pressable>
        ) : null}
      </View>

      {present.length > 1 ? (
        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
            {[{ id: '', label: 'All' }, ...present].map((c) => {
              const on = (category ?? '') === c.id;
              return (
                <Pressable key={c.id || 'all'} onPress={() => setCategory(c.id || null)} style={[s.chip, on && s.chipOn]}>
                  <Text style={[s.chipText, on && s.chipTextOn]}>{c.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      {faqs.isLoading ? (
        <View style={s.center}><ActivityIndicator size="large" color={authTheme.brand} /></View>
      ) : faqs.isError ? (
        <View style={s.center}>
          <Text style={s.errorText}>{getApiErrorMessage(faqs.error, 'Could not load FAQs.')}</Text>
          <Pressable onPress={() => void faqs.refetch()} style={s.retryBtn}>
            <Text style={s.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={sections}
          keyExtractor={(sec) => sec.title}
          contentContainerStyle={[s.list, { paddingBottom: insets.bottom + 32 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={s.emptyText}>{search ? 'No questions match your search.' : 'No FAQs available yet.'}</Text>
          }
          renderItem={({ item: sec }) => (
            <View style={s.section}>
              <Text style={s.sectionTitle}>{sec.title}</Text>
              {sec.items.map((f) => (
                <FaqCard key={f.id} faq={f} expanded={openId === f.id} onToggle={toggle} />
              ))}
            </View>
          )}
          ListFooterComponent={
            <Pressable style={s.helpCard} onPress={() => router.push('/support/new' as Href)} accessibilityRole="button">
              <MessageCircle size={20} color={authTheme.brand} />
              <View style={{ flex: 1 }}>
                <Text style={s.helpTitle}>Still need help?</Text>
                <Text style={s.helpSub}>Raise a ticket and our team will get back to you.</Text>
              </View>
            </Pressable>
          }
        />
      )}
    </View>
  );
}
