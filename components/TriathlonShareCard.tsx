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
}

const { width } = Dimensions.get('window');
const CARD_RATIO = 9 / 16;
const CARD_WIDTH = Math.round(width * 0.9);
const CARD_HEIGHT = Math.round(CARD_WIDTH / CARD_RATIO);

export const TriathlonShareCard = React.forwardRef((props: TriathlonShareCardProps, ref: React.Ref<View>) => {
  const { date, totalTime, swim, t1, bike, t2, run, width, height } = props;
  const cardWidth = width ?? CARD_WIDTH;
  const cardHeight = height ?? CARD_HEIGHT;
  const scale = cardWidth / CARD_WIDTH;
  const titleSize = Math.round(28 * scale);
  const dateSize = Math.round(16 * scale);
  const totalTimeSize = Math.round(54 * scale);
  const blockTitleSize = Math.round(18 * scale);
  const blockValueSize = Math.round(28 * scale);
  const blockSubSize = Math.round(15 * scale);
  const footerSize = Math.round(13 * scale);
  const paddingVertical = Math.round(32 * scale);
  const paddingHorizontal = Math.round(28 * scale);
  const borderRadius = Math.round(32 * scale);

  return (
    <View
      ref={ref}
      style={[
        styles.card,
        { width: cardWidth, height: cardHeight, paddingVertical, paddingHorizontal, borderRadius },
      ]}
      collapsable={false}
      pointerEvents="none"
    >
      <View style={styles.header}>
        <Text style={[styles.title, { fontSize: titleSize } ]}>TRIATHLON</Text>
        <Text style={[styles.date, { fontSize: dateSize }]}>{date}</Text>
      </View>

      <View style={styles.center}>
        <Text style={[styles.totalTime, { fontSize: totalTimeSize }]}>{totalTime}</Text>
      </View>

      <View style={styles.details}>
        <View style={styles.block}>
          <Text style={[styles.blockTitle, { fontSize: blockTitleSize }]}>SWIM</Text>
          <Text style={[styles.blockValue, { fontSize: blockValueSize }]}>{swim.time}</Text>
          <Text style={[styles.blockSub, { fontSize: blockSubSize }]}>{swim.distance}  •  {swim.pace}</Text>
        </View>

        {t1 && (
          <View style={styles.block}>
            <Text style={[styles.blockTitle, { fontSize: blockTitleSize }]}>T1</Text>
            <Text style={[styles.blockValue, { fontSize: blockValueSize }]}>{t1.time}</Text>
          </View>
        )}

        <View style={styles.block}>
          <Text style={[styles.blockTitle, { fontSize: blockTitleSize }]}>BIKE</Text>
          <Text style={[styles.blockValue, { fontSize: blockValueSize }]}>{bike.time}</Text>
          <Text style={[styles.blockSub, { fontSize: blockSubSize }]}>{bike.distance}  •  {bike.speed}</Text>
        </View>

        {t2 && (
          <View style={styles.block}>
            <Text style={[styles.blockTitle, { fontSize: blockTitleSize }]}>T2</Text>
            <Text style={[styles.blockValue, { fontSize: blockValueSize }]}>{t2.time}</Text>
          </View>
        )}

        <View style={styles.block}>
          <Text style={[styles.blockTitle, { fontSize: blockTitleSize }]}>RUN</Text>
          <Text style={[styles.blockValue, { fontSize: blockValueSize }]}>{run.time}</Text>
          <Text style={[styles.blockSub, { fontSize: blockSubSize }]}>{run.distance}  •  {run.pace}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { fontSize: footerSize }]}>Koa Endurance</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'transparent',
    borderRadius: 32,
    paddingVertical: 32,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: 'transparent',
  },
  header: {
    alignItems: 'center',
    marginBottom: 12,
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
    marginTop: 2,
    fontWeight: '500',
  },
  center: {
    alignItems: 'center',
    marginVertical: 18,
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
    gap: 18,
    marginVertical: 8,
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
    marginBottom: 2,
  },
  blockValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    opacity: 0.96,
    marginBottom: 2,
  },
  blockSub: {
    fontSize: 15,
    color: '#fff',
    opacity: 0.7,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    marginTop: 12,
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
