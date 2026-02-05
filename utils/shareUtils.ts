import { Share, Platform, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { TriathlonPrediction, RaceType, getRaceTypeName, getRaceDistances } from './triathlonPredictor';

// ============================================================================
// TRIATHLON PREDICTION PDF SHARE
// ============================================================================

export interface TriathlonPredictionShareData {
  prediction: TriathlonPrediction;
  raceType: RaceType;
  swimData?: {
    waterType: string;
    wetsuit?: boolean;
  };
  bikeData?: {
    ftp: number;
    ftpPercentage: number;
    distance: number;
    elevation: number;
  };
  runData?: {
    baseDistance: number;
  };
}

function generateTriathlonPdfHtml(data: TriathlonPredictionShareData): string {
  const { prediction, raceType } = data;
  const raceDistances = getRaceDistances(raceType);
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Previsão de Triathlon</title>
      <style>
        @page {
          margin: 20px;
        }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #f5f5f5;
          padding: 20px;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
          padding: 24px;
          text-align: center;
          color: white;
        }
        .header h1 {
          font-size: 24px;
          margin-bottom: 8px;
        }
        .header .race-type {
          font-size: 14px;
          opacity: 0.9;
        }
        .total-time {
          background: #1D4ED8;
          padding: 32px 24px;
          text-align: center;
          color: white;
        }
        .total-time .label {
          font-size: 14px;
          opacity: 0.8;
          margin-bottom: 8px;
        }
        .total-time .time {
          font-size: 48px;
          font-weight: bold;
          letter-spacing: 2px;
        }
        .content {
          padding: 24px;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 16px;
          color: #1D4ED8;
        }
        .modality {
          display: flex;
          align-items: center;
          padding: 16px;
          background: #f8fafc;
          border-radius: 12px;
          margin-bottom: 12px;
          border-left: 4px solid;
        }
        .modality.swim { border-left-color: #06B6D4; }
        .modality.bike { border-left-color: #F59E0B; }
        .modality.run { border-left-color: #EF4444; }
        .modality .icon {
          font-size: 28px;
          margin-right: 16px;
        }
        .modality .info {
          flex: 1;
        }
        .modality .name {
          font-size: 14px;
          color: #666;
        }
        .modality .time {
          font-size: 20px;
          font-weight: bold;
        }
        .modality .distance {
          font-size: 12px;
          color: #888;
          margin-top: 2px;
        }
        .transition {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 16px;
          background: #fef3c7;
          border-radius: 8px;
          margin-bottom: 12px;
          margin-left: 24px;
          margin-right: 24px;
          border: 1px dashed #f59e0b;
        }
        .transition .label {
          font-size: 13px;
          color: #92400e;
        }
        .transition .time {
          font-size: 14px;
          font-weight: 600;
          color: #92400e;
        }
        .factors {
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid #e5e7eb;
        }
        .factors .title {
          font-size: 12px;
          color: #444;
          margin-bottom: 4px;
          font-weight: 600;
        }
        .factors ul {
          list-style: none;
          padding-left: 0;
        }
        .factors li {
          font-size: 12px;
          color: #555;
          padding: 2px 0;
        }
        .factors li:before {
          content: "•";
          margin-right: 8px;
          color: #888;
        }
        .summary {
          background: #f8fafc;
          border-radius: 12px;
          padding: 16px;
          margin-top: 24px;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .summary-row:last-child {
          border-bottom: none;
          padding-top: 12px;
          margin-top: 8px;
          border-top: 2px solid #cbd5e1;
        }
        .summary-row .label {
          color: #666;
        }
        .summary-row .value {
          font-weight: 600;
        }
        .summary-row.total .label {
          font-size: 16px;
          font-weight: bold;
          color: #333;
        }
        .summary-row.total .value {
          font-size: 18px;
          color: #1D4ED8;
        }
        .footer {
          text-align: center;
          padding: 16px 24px 24px;
          color: #999;
          font-size: 11px;
        }
        .disclaimer {
          background: #fef3c7;
          padding: 12px;
          border-radius: 8px;
          margin-top: 16px;
          font-size: 11px;
          color: #92400e;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏊🚴🏃 Previsão de Triathlon</h1>
          <div class="race-type">${getRaceTypeName(raceType)}</div>
        </div>
        
        <div class="total-time">
          <div class="label">Tempo Total Estimado</div>
          <div class="time">${prediction.totalTimeFormatted}</div>
        </div>

        <div class="content">
          <h2 class="section-title">Detalhamento por Modalidade</h2>

          <div class="modality swim">
            <div class="icon">🏊</div>
            <div class="info">
              <div class="name">Natação</div>
              <div class="time">${prediction.swim.timeFormatted}</div>
              <div class="distance">${raceDistances.swim}m</div>
              ${prediction.swim.factors.length > 0 ? `
                <div class="factors">
                  <div class="title">Fatores aplicados:</div>
                  <ul>
                    ${prediction.swim.factors.map(f => `<li>${f}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>
          </div>

          <div class="transition">
            <span class="label">T1 (Transição)</span>
            <span class="time">${prediction.t1Formatted}</span>
          </div>

          <div class="modality bike">
            <div class="icon">🚴</div>
            <div class="info">
              <div class="name">Ciclismo</div>
              <div class="time">${prediction.bike.timeFormatted}</div>
              <div class="distance">${raceDistances.bike}km</div>
              ${prediction.bike.factors.length > 0 ? `
                <div class="factors">
                  <div class="title">Fatores aplicados:</div>
                  <ul>
                    ${prediction.bike.factors.map(f => `<li>${f}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>
          </div>

          <div class="transition">
            <span class="label">T2 (Transição)</span>
            <span class="time">${prediction.t2Formatted}</span>
          </div>

          <div class="modality run">
            <div class="icon">🏃</div>
            <div class="info">
              <div class="name">Corrida</div>
              <div class="time">${prediction.run.timeFormatted}</div>
              <div class="distance">${raceDistances.run}km</div>
              ${prediction.run.factors.length > 0 ? `
                <div class="factors">
                  <div class="title">Fatores aplicados:</div>
                  <ul>
                    ${prediction.run.factors.map(f => `<li>${f}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>
          </div>

          <div class="summary">
            <div class="summary-row">
              <span class="label">Natação</span>
              <span class="value">${prediction.swim.timeFormatted}</span>
            </div>
            <div class="summary-row">
              <span class="label">T1</span>
              <span class="value">${prediction.t1Formatted}</span>
            </div>
            <div class="summary-row">
              <span class="label">Ciclismo</span>
              <span class="value">${prediction.bike.timeFormatted}</span>
            </div>
            <div class="summary-row">
              <span class="label">T2</span>
              <span class="value">${prediction.t2Formatted}</span>
            </div>
            <div class="summary-row">
              <span class="label">Corrida</span>
              <span class="value">${prediction.run.timeFormatted}</span>
            </div>
            <div class="summary-row total">
              <span class="label">TOTAL</span>
              <span class="value">${prediction.totalTimeFormatted}</span>
            </div>
          </div>

          <div class="disclaimer">
            ⚠️ Esta é uma estimativa baseada em modelos matemáticos. 
            O tempo real pode variar de acordo com condições de prova, 
            estratégia de ritmo e outros fatores externos.
          </div>
        </div>

        <div class="footer">
          Gerado em ${currentDate} • TRI App
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function shareTriathlonPredictionAsPdf(data: TriathlonPredictionShareData): Promise<boolean> {
  try {
    const html = generateTriathlonPdfHtml(data);
    
    // Gerar PDF
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    // Verificar se o compartilhamento está disponível
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Compartilhar Previsão de Triathlon',
        UTI: 'com.adobe.pdf',
      });
      return true;
    } else {
      Alert.alert('Erro', 'Compartilhamento não disponível neste dispositivo');
      return false;
    }
  } catch (error) {
    console.error('Erro ao gerar/compartilhar PDF:', error);
    Alert.alert('Erro', 'Não foi possível gerar o PDF');
    return false;
  }
}

// ============================================================================
// ZONES SHARING
// ============================================================================

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