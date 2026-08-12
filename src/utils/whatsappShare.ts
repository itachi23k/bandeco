import { MealList } from '../types';

export const shareMealListWhatsApp = (mealList: MealList) => {
  const activeItems = mealList.items
    .filter(item => item.quantity > 0)
    .sort((a, b) => a.workerName.localeCompare(b.workerName, 'pt-BR'));

  let text = `*📋 CONTROLE DE REFEIÇÕES - TRECHO*\n`;
  text += `-----------------------------------\n`;
  text += `📌 *${mealList.title}*\n`;
  text += `📅 *Data:* ${mealList.date} | ⏰ *Turno:* ${mealList.shift}\n`;
  if (mealList.worksiteLocation) {
    text += `🚜 *Frente / Local:* ${mealList.worksiteLocation}\n`;
  }
  text += `👤 *Responsável:* ${mealList.createdByName}\n`;
  text += `☁️ *Status Sync:* ${mealList.status === 'sent' ? '✅ Sincronizado' : '🔒 Salvo Offline'}\n\n`;

  text += `🍱 *TOTAL DE MARMITAS: ${mealList.totalMarmitas}*\n`;
  text += `-----------------------------------\n`;
  text += `*LISTA DE CONSUMIDORES (A-Z):*\n`;

  activeItems.forEach((item, idx) => {
    const num = (idx + 1).toString().padStart(2, '0');
    const noteStr = item.notes ? ` _(${item.notes})_` : '';
    const sectorStr = item.sector ? ` [${item.sector}]` : '';
    text += `${num}. *${item.workerName}*${sectorStr} ➔ *${item.quantity}x*${noteStr}\n`;
  });

  if (mealList.notes) {
    text += `\n📝 *Observações:* ${mealList.notes}\n`;
  }

  text += `\n-----------------------------------\n`;
  text += `_Gerado via App Controle de Marmitas Terraplanagem_`;

  const encodedText = encodeURIComponent(text);
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;

  window.open(whatsappUrl, '_blank');
};
