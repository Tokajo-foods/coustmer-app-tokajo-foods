import { memo, useMemo } from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';

function queryTokens(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);
}

type Part = { text: string; hit: boolean };

/** Splits `text` so each word's prefix that matches a typed word can be bolded. */
function splitParts(text: string, query: string): Part[] {
  const tokens = queryTokens(query);
  if (!tokens.length) return [{ text, hit: false }];
  const parts: Part[] = [];
  for (const chunk of text.split(/([^\p{L}\p{N}]+)/u)) {
    if (!chunk) continue;
    const lower = chunk.toLowerCase();
    const token = tokens.find((t) => lower.startsWith(t));
    if (token) {
      parts.push({ text: chunk.slice(0, token.length), hit: true });
      if (chunk.length > token.length) parts.push({ text: chunk.slice(token.length), hit: false });
    } else {
      parts.push({ text: chunk, hit: false });
    }
  }
  return parts;
}

/** Text where every typed word is bolded where it starts a word ("ch bir" → **Ch**icken **Bir**yani). */
export const HighlightedText = memo(function HighlightedText({
  text,
  query,
  style,
  highlightStyle,
  numberOfLines = 1,
}: {
  text: string;
  query: string;
  style: StyleProp<TextStyle>;
  highlightStyle: StyleProp<TextStyle>;
  numberOfLines?: number;
}) {
  const parts = useMemo(() => splitParts(text, query), [text, query]);
  return (
    <Text style={style} numberOfLines={numberOfLines}>
      {parts.map((p, i) => (p.hit ? <Text key={i} style={highlightStyle}>{p.text}</Text> : p.text))}
    </Text>
  );
});
