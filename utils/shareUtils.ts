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
    text += `Zona ${zone.zone}: ${zone.name}\n`;
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
      title: 'Resultado do Tempo de Prova',
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
  let text = `🏊‍♂️ Tempo de Prova - ${data.raceDistance}\n\n`;
  text += `⏱️ Tempo Total: ${data.totalTime}\n\n`;

  text += `🏊 Natação (${data.swim.distance})\n`;
  text += `   Tempo: ${data.swim.time}\n`;
  if (data.swim.pace) {
    text += `   Ritmo: ${data.swim.pace}\n`;
  }
  text += `\n`;

  if (data.t1) {
    text += `🔄 T1 (Transição 1)\n`;
    text += `   Tempo: ${data.t1.time}\n\n`;
  }

  text += `🚴 Ciclismo (${data.bike.distance})\n`;
  text += `   Tempo: ${data.bike.time}\n`;
  if (data.bike.pace) {
    text += `   Ritmo: ${data.bike.pace}\n`;
  }
  text += `\n`;

  if (data.t2) {
    text += `🔄 T2 (Transição 2)\n`;
    text += `   Tempo: ${data.t2.time}\n\n`;
  }

  text += `🏃 Corrida (${data.run.distance})\n`;
  text += `   Tempo: ${data.run.time}\n`;
  if (data.run.pace) {
    text += `   Ritmo: ${data.run.pace}\n`;
  }

  return text;
}

export async function copySwimTimeToClipboard(data: RaceTimeData) {
  let text = `🏊 Natação (${data.swim.distance})\n`;
  text += `Tempo: ${data.swim.time}\n`;
  if (data.swim.pace) {
    text += `Ritmo: ${data.swim.pace}\n`;
  }
  
  try {
    await Clipboard.setStringAsync(text);
    return true;
  } catch (error) {
    console.error('Error copying swim time:', error);
    return false;
  }
}

export async function copyBikeTimeToClipboard(data: RaceTimeData) {
  let text = `🚴 Ciclismo (${data.bike.distance})\n`;
  text += `Tempo: ${data.bike.time}\n`;
  if (data.bike.pace) {
    text += `Ritmo: ${data.bike.pace}\n`;
  }
  
  try {
    await Clipboard.setStringAsync(text);
    return true;
  } catch (error) {
    console.error('Error copying bike time:', error);
    return false;
  }
}

export async function copyRunTimeToClipboard(data: RaceTimeData) {
  let text = `🏃 Corrida (${data.run.distance})\n`;
  text += `Tempo: ${data.run.time}\n`;
  if (data.run.pace) {
    text += `Ritmo: ${data.run.pace}\n`;
  }
  
  try {
    await Clipboard.setStringAsync(text);
    return true;
  } catch (error) {
    console.error('Error copying run time:', error);
    return false;
  }
}