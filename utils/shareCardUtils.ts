import { captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';

export async function exportShareCardToPng(ref: any): Promise<string | null> {
  try {
    const uri = await captureRef(ref, {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
      width: 1080,
      height: 1920,
      backgroundColor: 'transparent',
    });
    return uri;
  } catch (e) {
    console.error('Erro ao exportar card:', e);
    return null;
  }
}
