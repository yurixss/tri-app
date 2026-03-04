import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

interface TriathlonShareCardProps {
  date: string;
  totalTime: string;
  swim: { time: string; distance: string; pace: string };
  t1?: { time: string };
  bike: { time: string; distance: string; speed: string };
  t2?: { time: string };
  run: { time: string; distance: string; pace: string };
  width?: number;
  height?: number;
  textColor?: string;
  cardBgColor?: string;
}

const { width } = Dimensions.get('window');
const CARD_RATIO = 9 / 16;
const CARD_WIDTH = Math.round(width * 0.9);
const CARD_HEIGHT = Math.round(CARD_WIDTH / CARD_RATIO);

export const TriathlonShareCard = React.forwardRef((props: TriathlonShareCardProps, ref: React.Ref<View>) => {
  const { date, totalTime, swim, t1, bike, t2, run, width, height, textColor = '#fff', cardBgColor = 'transparent' } = props;
  const cardWidth = width ?? CARD_WIDTH;
  const cardHeight = height ?? CARD_HEIGHT;
  const scale = Math.min(cardWidth / CARD_WIDTH, cardHeight / CARD_HEIGHT);
  const titleSize = Math.round(22 * scale);
  const dateSize = Math.round(12 * scale);
  const totalTimeSize = Math.round(44 * scale);
  const blockTitleSize = Math.round(16 * scale);
  const blockValueSize = Math.round(22 * scale);
  const blockSubSize = Math.round(12 * scale);
  const footerSize = Math.round(11 * scale);
  const paddingVertical = Math.round(18 * scale);
  const paddingHorizontal = Math.round(16 * scale);
  const borderRadius = Math.round(24 * scale);

  return (
    <View
      ref={ref}
      style={[
        styles.card,
        { width: cardWidth, paddingVertical, paddingHorizontal, borderRadius, backgroundColor: cardBgColor },
      ]}
      collapsable={false}
      pointerEvents="none"
    >
      <View style={styles.topGroup}>
        <View style={styles.header}>
          <Text style={[styles.title, { fontSize: titleSize, color: textColor } ]}>TRIATHLON</Text>
          <Text style={[styles.date, { fontSize: dateSize, color: textColor }]}>{date}</Text>
        </View>
        <Text style={[styles.totalTime, { fontSize: totalTimeSize, color: textColor }]}>{totalTime}</Text>
      </View>

      <View style={styles.details}>
        <View style={styles.block}>
          <Text style={[styles.blockTitle, { fontSize: blockTitleSize, color: textColor }]}>SWIM</Text>
          <Text style={[styles.blockValue, { fontSize: blockValueSize, color: textColor }]}>{swim.distance}  •  {swim.pace}</Text>
          <Text style={[styles.blockSub, { fontSize: blockSubSize, color: textColor }]}>{swim.time}</Text>
        </View>

        {t1 && (
          <View style={styles.block}>
            <Text style={[styles.blockTitle, { fontSize: blockTitleSize, color: textColor }]}>T1</Text>
            <Text style={[styles.blockValue, { fontSize: blockValueSize, color: textColor }]}>{t1.time}</Text>
          </View>
        )}

        <View style={styles.block}>
          <Text style={[styles.blockTitle, { fontSize: blockTitleSize, color: textColor }]}>BIKE</Text>
          <Text style={[styles.blockValue, { fontSize: blockValueSize, color: textColor }]}>{bike.distance}  •  {bike.speed}</Text>
          <Text style={[styles.blockSub, { fontSize: blockSubSize, color: textColor }]}>{bike.time}</Text>
        </View>

        {t2 && (
          <View style={styles.block}>
            <Text style={[styles.blockTitle, { fontSize: blockTitleSize, color: textColor }]}>T2</Text>
            <Text style={[styles.blockValue, { fontSize: blockValueSize, color: textColor }]}>{t2.time}</Text>
          </View>
        )}

        <View style={styles.block}>
          <Text style={[styles.blockTitle, { fontSize: blockTitleSize, color: textColor }]}>RUN</Text>
          <Text style={[styles.blockValue, { fontSize: blockValueSize, color: textColor }]}>{run.distance}  •  {run.pace}</Text>
          <Text style={[styles.blockSub, { fontSize: blockSubSize, color: textColor }]}>{run.time}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { fontSize: footerSize, color: textColor }]}>Koa Endurance</Text>
      </View>
    </View>
  );
});

TriathlonShareCard.displayName = 'TriathlonShareCard';

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'transparent',
    borderRadius: 32,
    paddingVertical: 32,
    paddingHorizontal: 28,
    alignItems: 'center',
    shadowColor: 'transparent',
  },
  topGroup: {
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: '#fff',
    opacity: 0.96,
    textTransform: 'uppercase',
  },
  date: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.7,
    marginTop: 1,
    fontWeight: '500',
  },
  totalTime: {
    fontSize: 54,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1.5,
    opacity: 0.98,
    textShadowColor: 'rgba(0,0,0,0.10)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  details: {
    width: '100%',
    gap: 6,
    marginVertical: 4,
  },
  block: {
    alignItems: 'center',
    marginBottom: 2,
  },
  blockTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    opacity: 0.85,
    letterSpacing: 1.2,
    marginBottom: 0,
  },
  blockValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    opacity: 0.96,
    marginBottom: 0,
  },
  blockSub: {
    fontSize: 15,
    color: '#fff',
    opacity: 0.7,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    marginTop: 4,
  },
  footerText: {
    fontSize: 13,
    color: '#fff',
    opacity: 0.5,
    fontWeight: '600',
    letterSpacing: 1.1,
  },
});

export default TriathlonShareCard;
