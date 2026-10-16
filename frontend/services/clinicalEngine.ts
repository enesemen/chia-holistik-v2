import {
  BMRFormula,
  DayNameTR,
  OrbioClientProfile,
  StudioDayColumn,
  StudioIngredient,
  StudioMealCell,
  StudioRecipeItem,
} from '../types';
import { STUDIO_RECIPES } from '../data/orbioSeedData';

export const DAYS_TR: DayNameTR[] = [
  'Pazartesi',
  'Salı',
  'Çarşamba',
  'Perşembe',
  'Cuma',
  'Cumartesi',
  'Pazar',
];

export function trLower(text: string): string {
  return (text || '').trim().toLocaleLowerCase('tr-TR');
}

export function calculateClientEnergyAndWater(
  client: OrbioClientProfile,
  formula: BMRFormula = 'mifflin_st_jeor'
) {
  const { gender, weightKg, heightCm, age, palFactor, isBreastfeeding } = client;
  let bmr = 1400;
  if (formula === 'mifflin_st_jeor') {
    const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
    bmr = Math.round(gender === 'Erkek' ? base + 5 : base - 161);
  } else {
    bmr =
      gender === 'Erkek'
        ? Math.round(88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age)
        : Math.round(447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.33 * age);
  }

  const tdee = Math.round(bmr * (palFactor || 1.375));
  let recommendedKcal = Math.max(bmr, tdee - 350);
  if (isBreastfeeding) recommendedKcal = Math.max(1750, tdee - 100);
  recommendedKcal = Math.round(recommendedKcal / 50) * 50;

  const waterLiters = Math.min(4.0, Number((weightKg * 0.033).toFixed(2)));
  return { bmr, tdee, recommendedKcal, waterLiters };
}

// Tam Sayı Mutfak Kuantizasyonu (Yumurta, köfte, ince dilim ekmek asla 1.25 adet olmaz!)
export function formatQuantizedIngredient(
  ing: StudioIngredient,
  multiplier: number
): string {
  if (ing.isDiscrete) {
    const whole = Math.max(1, Math.round(ing.amount * multiplier));
    const g = Math.round((ing.grams / ing.amount) * whole);
    return `${whole} ${ing.unit} ${ing.name} (~${g}g)`;
  }
  if (ing.grams === 200 && ing.unit === 'fincan') {
    return `1 fincan ${ing.name} (Serbest)`;
  }
  const scaledG = Math.max(5, Math.round((ing.grams * multiplier) / 5) * 5);
  return `${scaledG}${ing.unit === 'ml' ? 'ml' : 'g'} ${ing.name}`;
}

export function calculateCellMacros(cell: StudioMealCell) {
  let kcal = 0,
    p = 0,
    c = 0,
    f = 0,
    fiber = 0;
  if (cell.recipe) {
    kcal += Math.round(cell.recipe.kcal * cell.multiplier);
    p += cell.recipe.p * cell.multiplier;
    c += cell.recipe.c * cell.multiplier;
    f += cell.recipe.f * cell.multiplier;
    fiber += cell.recipe.fiber * cell.multiplier;
  }
  for (const ex of cell.extraItems) {
    kcal += ex.kcal;
    p += ex.p;
    c += ex.c;
    f += ex.f;
  }
  return {
    kcal: Math.round(kcal),
    p: Number(p.toFixed(1)),
    c: Number(c.toFixed(1)),
    f: Number(f.toFixed(1)),
    fiber: Number(fiber.toFixed(1)),
  };
}

export function calculateDayTotals(day: StudioDayColumn) {
  return day.meals.reduce(
    (acc, m) => {
      const t = calculateCellMacros(m);
      acc.kcal += t.kcal;
      acc.p = Number((acc.p + t.p).toFixed(1));
      acc.c = Number((acc.c + t.c).toFixed(1));
      acc.f = Number((acc.f + t.f).toFixed(1));
      acc.fiber = Number((acc.fiber + t.fiber).toFixed(1));
      return acc;
    },
    { kcal: 0, p: 0, c: 0, f: 0, fiber: 0 }
  );
}

// Hücre Bazlı CDSS İlaç-Besin, IVF ve PMOS Denetleyicisi
export function evaluateCellCdssAlerts(
  cell: StudioMealCell,
  client: OrbioClientProfile
): Array<{ id: string; title: string; message: string; fixRecipeId: string; fixName: string }> {
  const alerts: Array<{
    id: string;
    title: string;
    message: string;
    fixRecipeId: string;
    fixName: string;
  }> = [];
  if (!cell.recipe) return alerts;

  const usesWarfarin = client.medications.some((m) =>
    /coumadin|warfarin|varfarin/i.test(m)
  );
  if (usesWarfarin && cell.recipe.highVitK) {
    alerts.push({
      id: `vitk_${cell.id}`,
      title: 'Coumadin ↔ Yüksek K-Vit (Ispanak)',
      message: 'Varfarin kullanan danışanda INR dalgalanmasına karşı düşük K-vitaminli alternatif önerilir.',
      fixRecipeId: 'rec_avokado_yumurta',
      fixName: 'Avokadolu & Lorlu Yumurta',
    });
  }

  if (client.ivfStage === 'stage4_2ww' && !cell.recipe.isWarm) {
    alerts.push({
      id: `2ww_cold_${cell.id}`,
      title: 'IVF 2WW ↔ Soğuk Öğün Uyarısı',
      message: '2WW implantasyon evresinde rahim kanlanması için ılık/sıcak öğün tercih edilmelidir.',
      fixRecipeId: 'rec_kayisi_ceviz',
      fixName: 'Gün Kurusu Kayısı & Ilık Rezene',
    });
  }

  if (client.ivfStage === 'stage2_opu' && cell.recipe.highFiber) {
    alerts.push({
      id: `opu_fiber_${cell.id}`,
      title: 'IVF OPU ↔ Yüksek Lif (OHSS Kalkanı)',
      message: 'Yumurta toplama (OPU) evresinde batın şişkinliği riskine karşı düşük lifli alternatif önerilir.',
      fixRecipeId: 'rec_hindi_kabak',
      fixName: 'Zerdeçallı Hindi & Fırın Kabak',
    });
  }

  const hasPmos =
    client.diagnoses.some((d) => /pmos|pcos|insülin/i.test(d)) ||
    (client.labs.homaIr && client.labs.homaIr >= 2.5);
  if (hasPmos && cell.slot === 'Akşam' && cell.recipe.c * cell.multiplier > 30) {
    alerts.push({
      id: `pmos_carb_${cell.id}`,
      title: 'PMOS Akşam Karbonhidrat Kalkanı',
      message: 'Akşam melatonin-insülin çakışmasını önlemek için düşük karbonhidratlı akşam öğünü önerilir.',
      fixRecipeId: 'rec_somon_firin',
      fixName: 'Biberiyeli Fırın Somon',
    });
  }

  return alerts;
}

export function buildInitialWeeklyMatrix(
  client: OrbioClientProfile,
  recipes: StudioRecipeItem[] = STUDIO_RECIPES
): StudioDayColumn[] {
  const bIds = ['rec_menemen', 'rec_avokado_yumurta', 'rec_frittata_ispanak', 'rec_menemen', 'rec_avokado_yumurta', 'rec_yulaf_chia', 'rec_avokado_yumurta'];
  const lIds = ['rec_kavanoz_bowl', 'rec_kemik_suyu_corba', 'rec_kavanoz_bowl', 'rec_hindi_kabak', 'rec_kavanoz_bowl', 'rec_anne_kofte', 'rec_somon_firin'];
  const dIds = ['rec_somon_firin', 'rec_hindi_kabak', 'rec_anne_kofte', 'rec_somon_firin', 'rec_yesil_mercimek', 'rec_kemik_suyu_corba', 'rec_hindi_kabak'];
  const s1Ids = ['rec_kayisi_ceviz', 'rec_elma_tahin', 'rec_kayisi_ceviz', 'rec_elma_tahin', 'rec_kayisi_ceviz', 'rec_elma_tahin', 'rec_kayisi_ceviz'];
  const s2Ids = ['rec_elma_tahin', 'rec_kefir_badem', 'rec_elma_tahin', 'rec_kayisi_ceviz', 'rec_elma_tahin', 'rec_kayisi_ceviz', 'rec_elma_tahin'];

  const getR = (id: string) => recipes.find((r) => r.id === id) || recipes[0];

  const seedText =
    client.seedPhase === 'luteal'
      ? '🌱 Luteal Tohum Kürü: 1 yk Susam/Tahin + 1 yk Ay Çekirdeği (20g)'
      : client.seedPhase === 'follicular'
      ? '🌱 Foliküler Tohum Kürü: 1 yk Öğütülmüş Keten + 1 yk Kabak Çekirdeği (20g)'
      : undefined;

  return DAYS_TR.map((dayName, idx) => ({
    dayIndex: idx,
    dayName,
    isOfficeDay: idx < 5,
    isCollapsed: idx >= 5, // VARSAYILAN 5+2: Hafta İçi 5 Gün Açık, Cumartesi & Pazar Daraltılmış Şerit!
    meals: [
      {
        id: `cell_${idx}_Kahvaltı`,
        slot: 'Kahvaltı',
        time: '08:30',
        isPinned: false,
        multiplier: 1.25,
        recipe: getR(bIds[idx]),
        extraItems: [],
        zeroWasteNote:
          idx === 4
            ? '♻️ Sıfır İsraf: Salı gününden kalan olgun avokado tamamlandı'
            : undefined,
      },
      {
        id: `cell_${idx}_Kuşluk`,
        slot: 'Kuşluk',
        time: '11:00',
        isPinned: false,
        multiplier: 1.0,
        recipe: getR(s1Ids[idx]),
        extraItems: [],
      },
      {
        id: `cell_${idx}_Öğle`,
        slot: 'Öğle',
        time: '13:00',
        isPinned: false,
        multiplier: 1.25,
        recipe: getR(lIds[idx]),
        extraItems: [],
      },
      {
        id: `cell_${idx}_İkindi`,
        slot: 'İkindi',
        time: '16:30',
        isPinned: false,
        multiplier: 1.0,
        recipe: getR(s2Ids[idx]),
        extraItems: [],
        seedNote: seedText,
      },
      {
        id: `cell_${idx}_Akşam`,
        slot: 'Akşam',
        time: '19:30',
        isPinned: false,
        multiplier: 1.25,
        recipe: getR(dIds[idx]),
        extraItems: [],
      },
    ],
  }));
}

export function mutateRecipeSafely(
  recipe: StudioRecipeItem,
  mode: 'low_vit_k' | 'warm_2ww' | 'low_fiber_opu'
): StudioRecipeItem {
  if (mode === 'low_vit_k') {
    return {
      ...recipe,
      id: `${recipe.id}_mut_vitk`,
      name: `${recipe.name} (Coumadin Düşük K-Vit Uyarlama)`,
      highVitK: false,
      ingredients: recipe.ingredients.map((ing) =>
        ing.isHighVitK
          ? { ...ing, name: 'Fırınlanmış Sakız Kabağı & Kapya Biber (Düşük K-Vit)', isHighVitK: false }
          : ing
      ),
    };
  }
  if (mode === 'warm_2ww') {
    return {
      ...recipe,
      id: `${recipe.id}_mut_warm`,
      name: `${recipe.name} (2WW Ilık & Tarçınlı Uyarlama)`,
      isWarm: true,
    };
  }
  return {
    ...recipe,
    id: `${recipe.id}_mut_opu`,
    name: `${recipe.name} (OPU Düşük Lif Uyarlama)`,
    highFiber: false,
    fiber: 2.2,
  };
}