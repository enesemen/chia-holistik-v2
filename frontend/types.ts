export type DayNameTR =
  | 'Pazartesi'
  | 'Salı'
  | 'Çarşamba'
  | 'Perşembe'
  | 'Cuma'
  | 'Cumartesi'
  | 'Pazar';

export type MealSlotType = 'Kahvaltı' | 'Kuşluk' | 'Öğle' | 'İkindi' | 'Akşam' | 'Gece';

export type BMRFormula = 'mifflin_st_jeor' | 'harris_benedict';

export type IVFStage =
  | 'none'
  | 'stage1_stimulation'
  | 'stage2_opu'
  | 'stage3_transfer'
  | 'stage4_2ww';

export type SeedCyclingPhase = 'none' | 'follicular' | 'luteal';

export type SemanticZoomMode = 'compact' | 'kitchen' | 'xray';
export type CollapsePresetMode = '5+2' | '2+5' | 'all' | 'custom';

export type TopAccordionType = 'none' | 'clinical_bento' | 'macro_config';
export type LeftDrawerType = 'none' | 'recipes' | 'foods' | 'blocks' | 'exchanges';
export type RightDrawerType = 'none' | 'inspector' | 'zen_preview' | 'vaul_seal';
export type BottomDrawerType = 'none' | 'cdss_radar' | 'grocery_list';

export interface StudioIngredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  grams: number;
  kcal: number;
  p: number;
  c: number;
  f: number;
  category: 'protein' | 'carb' | 'fat' | 'veg' | 'fruit' | 'dairy' | 'spice';
  isDiscrete?: boolean;
  isHighVitK?: boolean;
}

export interface StudioRecipeItem {
  id: string;
  name: string;
  family: string;
  category: 'Kahvaltılıklar' | 'Ana Yemek' | 'Çorbalar' | 'Salata & Bowl' | 'Ara Öğün';
  meals: MealSlotType[];
  dietTags: string[];
  prepMinutes: number;
  isPortable: boolean;
  isWarm: boolean;
  highVitK?: boolean;
  highFiber?: boolean;
  kcal: number;
  p: number;
  c: number;
  f: number;
  fiber: number;
  exchanges: string;
  clinicalNote: string;
  steps: string[];
  ingredients: StudioIngredient[];
}

export interface TurKompFoodEntry {
  id: string;
  code: string;
  name: string;
  category: 'protein' | 'carb' | 'fat' | 'veg' | 'fruit' | 'dairy';
  measure: string;
  grams: number;
  kcal: number;
  p: number;
  c: number;
  f: number;
  fiber: number;
}

export interface TddExchangeRule {
  id: string;
  name: string;
  group: string;
  portion: string;
  stateNote: string;
  equivalents: string;
  clinicalNote: string;
}

export interface ExtraFoodRow {
  id: string;
  text: string;
  kcal: number;
  p: number;
  c: number;
  f: number;
}

export interface StudioMealCell {
  id: string;
  slot: MealSlotType;
  time: string;
  isPinned: boolean;
  multiplier: number;
  recipe: StudioRecipeItem | null;
  extraItems: ExtraFoodRow[];
  seedNote?: string;
  batchNote?: string;
  zeroWasteNote?: string;
}

export interface StudioDayColumn {
  dayIndex: number;
  dayName: DayNameTR;
  isOfficeDay: boolean;
  isCollapsed: boolean;
  meals: StudioMealCell[];
}

export interface OrbioClientProfile {
  id: string;
  fullName: string;
  age: number;
  gender: 'Kadın' | 'Erkek';
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  waistCm: number;
  hipCm: number;
  palFactor: number;
  packageDay: number;
  hazirlikTarihi: string;
  diagnoses: string[];
  allergies: string[];
  medications: string[];
  ivfStage: IVFStage;
  seedPhase: SeedCyclingPhase;
  isBreastfeeding?: boolean;
  labs: {
    homaIr?: number;
    ferritin?: number;
    vitD?: number;
    b12?: number;
    inr?: number;
  };
  threeDaySummary: {
    avgKcal: number;
    avgP: number;
    avgC: number;
    avgF: number;
    waterL: number;
    insight: string;
  };
  privateClinicalNote: string;
  sessionFeeTl: number;
}

export interface SealedPlanRecord {
  id: string;
  version: number;
  title: string;
  sealedAt: string;
  sha256: string;
  targetCalories: number;
  waterLiters: number;
  welcomeLetter: string;
  scaleLockedFor14Days: boolean;
  days: StudioDayColumn[];
}