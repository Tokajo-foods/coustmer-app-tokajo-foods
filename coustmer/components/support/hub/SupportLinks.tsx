import { useRouter, type Href } from 'expo-router';
import { ChevronRight, FileText, HelpCircle } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { Pressable } from '@/components/common/Pressable';
import { authTheme } from '@/constants/auth-theme';

import { hubStyles as s } from './support-hub-styles';

const LINKS = [
  {
    title: 'Browse FAQs',
    sub: 'Orders, payments, refunds, delivery and account',
    route: '/support/faq',
    Icon: HelpCircle,
  },
  {
    title: 'Legal, Terms & Conditions',
    sub: 'Terms of use, privacy, refunds and grievances',
    route: '/support/legal',
    Icon: FileText,
  },
] as const;

export function SupportLinks() {
  const router = useRouter();
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>HELP CENTRE</Text>
      <View style={s.linkCard}>
        {LINKS.map(({ title, sub, route, Icon }, i) => (
          <Pressable
            key={route}
            style={[s.linkRow, i > 0 && s.linkRowBorder]}
            onPress={() => router.push(route as Href)}
            accessibilityRole="button"
          >
            <View style={s.linkIcon}>
              <Icon size={18} color={authTheme.brand} strokeWidth={2} />
            </View>
            <View style={s.linkText}>
              <Text style={s.linkTitle}>{title}</Text>
              <Text style={s.linkSub}>{sub}</Text>
            </View>
            <ChevronRight color="#9CA3AF" size={18} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}
