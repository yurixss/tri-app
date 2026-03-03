import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Waves, Bicycle, Run } from 'phosphor-react-native';

interface TriathlonSplitShareCardProps {
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_RATIO = 9 / 16;
const DEFAULT_CARD_WIDTH = Math.round(SCREEN_WIDTH * 0.9);
const DEFAULT_CARD_HEIGHT = Math.round(DEFAULT_CARD_WIDTH / CARD_RATIO);

const TriathlonSplitShareCard = React.forwardRef((props: TriathlonSplitShareCardProps, ref: React.Ref<View>) => {
  const { date, totalTime, swim, t1, bike, t2, run, width, height } = props;
  const cardWidth = width ?? DEFAULT_CARD_WIDTH;
  const cardHeight = height ?? DEFAULT_CARD_HEIGHT;
  const scale = Math.min(cardWidth / DEFAULT_CARD_WIDTH, cardHeight / DEFAULT_CARD_HEIGHT);

  const iconSize = Math.round(24 * scale);
  // decrease modality time size
  const timeSize = Math.round(24 * scale);
  const smallSize = Math.round(10 * scale);
  // total time slightly larger but constrained
  const totalSize = Math.round(40 * scale);
  const footerSize = Math.round(10 * scale);
  const borderRadius = Math.round(16 * scale);

  return (
    <View
      ref={ref}
      style={[styles.card, { width: cardWidth, height: cardHeight, borderRadius }]}
      collapsable={false}
      pointerEvents="none"
    >
      <View style={styles.topRow}>
        <Text style={[styles.date, { fontSize: smallSize }]}>{date}</Text>
        <Text style={[styles.title, { fontSize: smallSize }]}>TRIATHLON</Text>
      </View>

      <View style={[styles.totalContainer, { width: '100%' }]}> 
        <Text style={[styles.total, { fontSize: totalSize, fontWeight: '800' }]}>{totalTime}</Text>
      </View>

      <View style={styles.splitRow}>
        <View style={styles.splitCol}>
          <Waves size={iconSize} color="#fff" weight="regular" />
          <Text style={[styles.time, { fontSize: timeSize }]}>{swim.time}</Text>
          <Text style={[styles.sub, { fontSize: smallSize }]}>{swim.distance}</Text>
        </View>

        <View style={styles.splitColMiddle}>
          <Text style={[styles.iconSmall]}>T1</Text>
          <Text style={[styles.smallTime, { fontSize: smallSize }]}>{t1?.time ?? '-'}</Text>
        </View>

        <View style={styles.splitCol}>
          <Bicycle size={iconSize} color="#fff" weight="regular" />
          <Text style={[styles.time, { fontSize: timeSize }]}>{bike.time}</Text>
          <Text style={[styles.sub, { fontSize: smallSize }]}>{bike.distance}</Text>
        </View>

        <View style={styles.splitColMiddle}>
          <Text style={[styles.iconSmall]}>T2</Text>
          <Text style={[styles.smallTime, { fontSize: smallSize }]}>{t2?.time ?? '-'}</Text>
        </View>

        <View style={styles.splitCol}>
          {typeof Run === 'function' ? (
            <Run size={Math.max(iconSize - 4, 12)} color="#fff" weight="thin" />
          ) : (
            <Text style={[styles.icon, { fontSize: iconSize }]}>🏃</Text>
          )}
          <Text style={[styles.time, { fontSize: timeSize }]}>{run.time}</Text>
          <Text style={[styles.sub, { fontSize: smallSize }]}>{run.distance}</Text>
        </View>
      </View>

      <View style={styles.footerRow}>
        <Text style={[styles.watermark, { fontSize: footerSize }]}>Koa Endurance</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'transparent',
    padding: 6,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  date: {
    color: '#fff',
    opacity: 0.8,
  },
  title: {
    color: '#fff',
    opacity: 0.9,
    fontWeight: '700',
  },
  splitRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 0,
  },
  splitCol: {
    flex: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splitColMiddle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    color: '#fff',
    marginBottom: 2,
  },
  iconSmall: {
    color: '#fff',
    fontWeight: '700',
    marginBottom: 4,
  },
  time: {
    color: '#fff',
    fontWeight: '800',
    marginBottom: 2,
  },
  smallTime: {
    color: '#fff',
    opacity: 0.9,
  },
  sub: {
    color: '#fff',
    opacity: 0.7,
  },
  footerRow: {
    width: '100%',
    alignItems: 'center',
    marginTop: 2,
  },
  total: {
    color: '#fff',
    opacity: 0.85,
    marginBottom: 0,
  },
  watermark: {
    color: '#fff',
    opacity: 0.5,
    fontWeight: '600',
    letterSpacing: 1,
  },
  totalContainer: {
    alignItems: 'center',
    marginVertical: 0,
    marginBottom: -6,
  },
});

export default TriathlonSplitShareCard;
