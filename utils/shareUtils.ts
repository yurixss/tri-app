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