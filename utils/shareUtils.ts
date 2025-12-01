import { Share, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';

export async function shareZones(title: string, zones: any[]) {
  const formattedZones = formatZonesForSharing(title, zones);
  
  try {
    await Share.share({
      message: formattedZones,
      title: title,
    });
  } catch (error) {
    console.error('Error sharing zones:', error);
  }
}

export async function copyZonesToClipboard(title: string, zones: any[]) {
  const formattedZones = formatZonesForSharing(title, zones);
  
  try {
    await Clipboard.setStringAsync(formattedZones);
    return true;
  } catch (error) {
    console.error('Error copying zones:', error);
    return false;
  }
}

function formatZonesForSharing(title: string, zones: any[]): string {
  let text = `${title}\n\n`;
  
  zones.forEach(zone => {
    text += `Zone ${zone.zone}: ${zone.name}\n`;
    text += `${zone.range}\n`;
    text += `${zone.description}\n\n`;
  });
  
  return text;
}

export interface RaceTimeData {
  raceDistance: string;
  totalTime: string;
  swim: {
    time: string;
    pace?: string;
    distance: string;
  };
  t1?: {
    time: string;
  };
  bike: {
    time: string;
    pace?: string;
    distance: string;
  };
  t2?: {
    time: string;
  };
  run: {
    time: string;
    pace?: string;
    distance: string;
  };
}

export async function shareRaceTime(data: RaceTimeData) {
  const formattedText = formatRaceTimeForSharing(data);
  
  try {
    await Share.share({
      message: formattedText,
      title: 'Race Time Results',
    });
  } catch (error) {
    console.error('Error sharing race time:', error);
  }
}

export async function copyRaceTimeToClipboard(data: RaceTimeData) {
  const formattedText = formatRaceTimeForSharing(data);
  
  try {
    await Clipboard.setStringAsync(formattedText);
    return true;
  } catch (error) {
    console.error('Error copying race time:', error);
    return false;
  }
}

function formatRaceTimeForSharing(data: RaceTimeData): string {
  let text = `🏊‍♂️ Triathlon Race Time - ${data.raceDistance}\n\n`;
  text += `⏱️ Total Time: ${data.totalTime}\n\n`;
  
  text += `🏊 Swim (${data.swim.distance})\n`;
  text += `   Time: ${data.swim.time}\n`;
  if (data.swim.pace) {
    text += `   Pace: ${data.swim.pace}\n`;
  }
  text += `\n`;
  
  if (data.t1) {
    text += `🔄 T1 (Transition 1)\n`;
    text += `   Time: ${data.t1.time}\n\n`;
  }
  
  text += `🚴 Bike (${data.bike.distance})\n`;
  text += `   Time: ${data.bike.time}\n`;
  if (data.bike.pace) {
    text += `   Pace: ${data.bike.pace}\n`;
  }
  text += `\n`;
  
  if (data.t2) {
    text += `🔄 T2 (Transition 2)\n`;
    text += `   Time: ${data.t2.time}\n\n`;
  }
  
  text += `🏃 Run (${data.run.distance})\n`;
  text += `   Time: ${data.run.time}\n`;
  if (data.run.pace) {
    text += `   Pace: ${data.run.pace}\n`;
  }
  
  return text;
}