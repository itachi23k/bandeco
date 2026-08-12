import { MealList } from '../types';

export const exportMealListJSON = (mealList: MealList) => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(mealList, null, 2));
  const downloadAnchor = document.createElement('a');
  const filename = `marmitas_${mealList.date}_${mealList.shift.toLowerCase().replace(/[^a-z0-9]/g, '')}_${mealList.id}.json`;
  
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

export const exportAllMealListsJSON = (mealLists: MealList[]) => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(mealLists, null, 2));
  const downloadAnchor = document.createElement('a');
  const filename = `backup_listas_marmitas_terraplanagem_${new Date().toISOString().slice(0,10)}.json`;
  
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

export const parseImportedJSON = async (file: File): Promise<MealList[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          resolve(json);
        } else if (json && typeof json === 'object' && json.title) {
          resolve([json as MealList]);
        } else {
          reject(new Error('Formato de arquivo JSON inválido.'));
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Erro ao ler o arquivo JSON.'));
    reader.readAsText(file);
  });
};
