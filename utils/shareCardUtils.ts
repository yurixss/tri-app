import { captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system/legacy';
import * as Clipboard from 'expo-clipboard';

export async function exportShareCardToPng(ref: any): Promise<string | null> {
  try {
    const uri = await captureRef(ref, {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
      width: 1080,
    });
    return uri;
  } catch (e) {
    console.error('Erro ao exportar card:', e);
    return null;
  }
}

export async function copyShareCardToClipboard(ref: any): Promise<boolean> {
  try {
    const uri = await exportShareCardToPng(ref);
    if (!uri) {
      console.error('Falha ao gerar imagem do card');
      return false;
    }

    // Ler a imagem como base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    });

    // Copiar para o clipboard
    await Clipboard.setImageAsync(base64);

    // Limpar arquivo temporário
    await FileSystem.deleteAsync(uri).catch(() => {});

    return true;
  } catch (e) {
    console.error('Erro ao copiar card para clipboard:', e);
    return false;
  }
}
