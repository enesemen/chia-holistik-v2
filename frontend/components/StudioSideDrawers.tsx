import React, { useState } from 'react';
import {
  ChefHat,
  Apple,
  Sparkles,
  Scale,
  Sliders,
  Eye,
  Send,
  History,
  Search,
  X,
  Plus,
  Wand2,
  CheckCircle2,
  Lock,
  Droplets,
  RotateCcw,
  Layers,
  BookOpen,
  Smartphone,
  EyeOff,
} from 'lucide-react';
import {
  LeftDrawerType,
  OrbioClientProfile,
  RightDrawerType,
  SealedPlanRecord,
  StudioDayColumn,
  StudioMealCell,
  StudioRecipeItem,
} from '../types';
import {
  READY_CLINICAL_BLOCKS,
  STUDIO_RECIPES,
  TDD_EXCHANGE_RULES,
  TURKOMP_FOODS,
} from '../data/orbioSeedData';
import {
  formatQuantizedIngredient,
  mutateRecipeSafely,
  trLower,
} from '../services/clinicalEngine';

interface LeftArsenalProps {
  leftDrawer: LeftDrawerType;
  activeDayName: string;
  activeSlotName: string;
  onSetLeftDrawer: (val: LeftDrawerType) => void;
  onAssignRecipe: (recipe: StudioRecipeItem) => void;
  onAddExtraFood: (text: string, kcal: number, p: number, c: number, f: number) => void;
  workspaceMode: 'diet_studio' | 'recipe_library' | 'pwa_simulator';
  onSetWorkspaceMode: (mode: 'diet_studio' | 'recipe_library' | 'pwa_simulator') => void;
  safeShareActive: boolean;
  onToggleSafeShare: () => void;
}

export const StudioLeftArsenalDrawer: React.FC<LeftArsenalProps> = ({
  leftDrawer,
  activeDayName,
  activeSlotName,
  onSetLeftDrawer,
  onAssignRecipe,
  onAddExtraFood,
  workspaceMode,
  onSetWorkspaceMode,
  safeShareActive,
  onToggleSafeShare,
}) => {
  const [search, setSearch] = useState('');
  const q = trLower(search);

  const railItems: Array<{
    id: Exclude<LeftDrawerType, 'none'>;
    label: string;
    icon: React.FC<{ className?: string }>;
  }> = [
    { id: 'recipes', label: '1. Klinik Tarif Havuzu', icon: ChefHat },
    { id: 'foods', label: '2. TürKomp 100g Besinler', icon: Apple },
    { id: 'blocks', label: '3. Hazır Klinik Bloklar', icon: Sparkles },
    { id: 'exchanges', label: '4. TDD Değişim Rehberi', icon: Scale },
  ];

  return (
    <div className="flex h-full shrink-0 z-20 relative">
      {/* SOL 48px SABİT DİKEY İKON RAYI */}
      <div className="w-12 bg-stone-50 border-r border-stone-200 flex flex-col items-center py-2.5 gap-2 shrink-0 h-full justify-between">
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] font-extrabold text-teal-800 uppercase tracking-tighter">
            SOL
          </span>
          {railItems.map((item) => {
            const Icon = item.icon;
            const active = leftDrawer === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSetLeftDrawer(active ? 'none' : item.id)}
                title={item.label}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  active
                    ? 'bg-teal-700 text-white shadow-sm scale-105'
                    : 'bg-white border border-stone-200 text-stone-600 hover:border-teal-500 hover:text-teal-800'
                }`}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>

        {/* EN ALT: 3 SAYFA MODÜLÜ VE SAFE SHARE SADECE İKON ÖĞESİ */}
        <div className="flex flex-col items-center gap-2 pt-2 border-t border-stone-200 w-full">
          <button
            type="button"
            onClick={() => onSetWorkspaceMode('diet_studio')}
            title="1. Tek Tuval Diyet Stüdyosu"
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              workspaceMode === 'diet_studio'
                ? 'bg-teal-700 text-white shadow-sm scale-105'
                : 'bg-white border border-stone-200 text-stone-600 hover:border-teal-500 hover:text-teal-800'
            }`}
          >
            <Layers className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onSetWorkspaceMode('recipe_library')}
            title="2. Klinik Tarif & Değişim Kütüphanesi"
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              workspaceMode === 'recipe_library'
                ? 'bg-teal-700 text-white shadow-sm scale-105'
                : 'bg-white border border-stone-200 text-stone-600 hover:border-teal-500 hover:text-teal-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onSetWorkspaceMode('pwa_simulator')}
            title="3. Danışan Mobil Portal (PWA Zen)"
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              workspaceMode === 'pwa_simulator'
                ? 'bg-purple-600 text-white shadow-sm scale-105'
                : 'bg-white border border-stone-200 text-stone-600 hover:border-purple-500 hover:text-purple-800'
            }`}
          >
            <Smartphone className="w-4 h-4" />
          </button>

          <div className="w-6 h-[1px] bg-stone-200 my-0.5" />

          <button
            type="button"
            onClick={onToggleSafeShare}
            title={
              safeShareActive
                ? 'Safe-Share Aktif (Hassas Veriler Gizli)'
                : 'Safe-Share Testi (Danışan Gizlilik Modu)'
            }
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              safeShareActive
                ? 'bg-emerald-600 text-white shadow-sm scale-105'
                : 'bg-white border border-stone-200 text-stone-600 hover:border-emerald-500 hover:text-emerald-800'
            }`}
          >
            {safeShareActive ? (
              <EyeOff className="w-4 h-4 text-white" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* SOL AÇILIR/KAPANIR YÜZER ÇEKMECE (Sürükleyince Otomatik Kapanır) */}
      {leftDrawer !== 'none' && (
        <div className="w-80 bg-white border-r border-stone-200 shadow-2xl flex flex-col h-full z-30 animate-in slide-in-from-left-2 duration-150">
          <div className="px-3.5 py-2.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 block">
                Sol Cephanelik Çekmecesi
              </span>
              <span className="text-xs font-bold text-stone-900">
                Hedef: {activeDayName} · {activeSlotName}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onSetLeftDrawer('none')}
              className="w-7 h-7 rounded-lg bg-white border border-stone-200 text-stone-500 hover:text-stone-900 flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-2.5 border-b border-stone-100">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tarif, TürKomp besini veya değişim ara..."
                className="w-full h-8 pl-8 pr-3 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-teal-600"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 space-y-2 text-xs">
            {leftDrawer === 'recipes' &&
              STUDIO_RECIPES.filter((r) =>
                trLower(`${r.name} ${r.category} ${r.family}`).includes(q)
              ).map((rec) => (
                <div
                  key={rec.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/orbio-recipe-id', rec.id);
                    setTimeout(() => onSetLeftDrawer('none'), 120);
                  }}
                  onClick={() => {
                    onAssignRecipe(rec);
                    onSetLeftDrawer('none');
                  }}
                  className="p-2.5 rounded-xl bg-stone-50 hover:bg-teal-50/70 border border-stone-200 hover:border-teal-600 cursor-pointer space-y-1 transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-stone-900">{rec.name}</span>
                    <span className="font-bold text-teal-800 shrink-0">
                      {rec.kcal} kcal
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-stone-500 font-semibold">
                    <span>{rec.exchanges}</span>
                    <span className="text-teal-700">Tıkla veya Sürükle →</span>
                  </div>
                </div>
              ))}

            {leftDrawer === 'foods' &&
              TURKOMP_FOODS.filter((f) =>
                trLower(`${f.name} ${f.code}`).includes(q)
              ).map((food) => (
                <div
                  key={food.id}
                  onClick={() =>
                    onAddExtraFood(
                      `${food.measure} ${food.name}`,
                      food.kcal,
                      food.p,
                      food.c,
                      food.f
                    )
                  }
                  className="p-2.5 rounded-xl bg-stone-50 hover:bg-teal-50/70 border border-stone-200 hover:border-teal-600 cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-stone-900">{food.name}</div>
                    <div className="text-[10px] text-stone-500">
                      {food.code} · {food.measure} ({food.kcal} kcal)
                    </div>
                  </div>
                  <Plus className="w-4 h-4 text-teal-700 shrink-0" />
                </div>
              ))}

            {leftDrawer === 'blocks' &&
              READY_CLINICAL_BLOCKS.map((blk) => (
                <div
                  key={blk.id}
                  onClick={() => {
                    onAddExtraFood(blk.text, blk.kcal, blk.p, blk.c, blk.f);
                    onSetLeftDrawer('none');
                  }}
                  className="p-3 rounded-xl bg-purple-50/60 hover:bg-purple-100/70 border border-purple-200 cursor-pointer space-y-1"
                >
                  <span className="text-[10px] font-bold uppercase text-purple-700">
                    {blk.badge}
                  </span>
                  <div className="font-bold text-stone-900">{blk.title}</div>
                  <p className="text-[11px] text-stone-600">{blk.text}</p>
                </div>
              ))}

            {leftDrawer === 'exchanges' &&
              TDD_EXCHANGE_RULES.filter((ex) =>
                trLower(`${ex.name} ${ex.group} ${ex.equivalents}`).includes(q)
              ).map((ex) => (
                <div
                  key={ex.id}
                  className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1"
                >
                  <div className="font-bold text-teal-900">
                    {ex.name} ({ex.portion})
                  </div>
                  <div className="text-[10px] font-bold text-stone-500">
                    {ex.group} · {ex.stateNote}
                  </div>
                  <p className="text-[11px] text-stone-700">
                    <strong>Eşdeğer:</strong> {ex.equivalents}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface RightInspectorAndVaulProps {
  rightDrawer: RightDrawerType;
  client: OrbioClientProfile;
  activeDay: StudioDayColumn;
  activeCell: StudioMealCell;
  allDays: StudioDayColumn[];
  targetCalories: number;
  waterLiters: number;
  sealedHistory: SealedPlanRecord[];
  onSetRightDrawer: (val: RightDrawerType) => void;
  onUpdateMultiplier: (mult: number) => void;
  onAssignRecipe: (recipe: StudioRecipeItem) => void;
  onAddExtraFood: (text: string, kcal: number, p: number, c: number, f: number) => void;
  onSealPlan: (title: string, note: string) => void;
  onRestorePlan: (days: StudioDayColumn[]) => void;
}

export const StudioRightInspectorDrawer: React.FC<RightInspectorAndVaulProps> = ({
  rightDrawer,
  client,
  activeDay,
  activeCell,
  allDays,
  targetCalories,
  waterLiters,
  sealedHistory,
  onSetRightDrawer,
  onUpdateMultiplier,
  onAssignRecipe,
  onAddExtraFood,
  onSealPlan,
  onRestorePlan,
}) => {
  const [veyaInput, setVeyaInput] = useState('');
  const [swapSearch, setSwapSearch] = useState('');
  const [planTitle, setPlanTitle] = useState(
    `${client.fullName} · ${client.packageDay}. Gün Klinik Beslenme Planı`
  );
  const [welcomeNote, setWelcomeNote] = useState(
    'Bu haftaki programınız biyolojik döngünüze ve klinik hedeflerinize özel olarak dengelendi. Mutfak gramajlarınızı keyifle uygulayabilirsiniz.'
  );

  const rightRailItems: Array<{
    id: Exclude<RightDrawerType, 'none'>;
    label: string;
    icon: React.FC<{ className?: string }>;
  }> = [
    { id: 'inspector', label: '1. Hücre Mikroskopu & Mutasyon', icon: Sliders },
    { id: 'zen_preview', label: '2. Danışan Zen Önizleme', icon: Eye },
    { id: 'vaul_seal', label: '3. Vaul Mühürle & Arşiv', icon: Send },
  ];

  return (
    <div className="flex h-full shrink-0 z-20 relative">
      {/* SAĞ AÇILIR/KAPANIR YÜZER ÇEKMECE */}
      {rightDrawer !== 'none' && (
        <div className="w-88 bg-white border-l border-stone-200 shadow-2xl flex flex-col h-full z-30 animate-in slide-in-from-right-2 duration-150">
          <div className="px-4 py-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">
                {rightDrawer === 'inspector'
                  ? 'Sağ Hücre Mikroskopu & AI Mutasyon'
                  : rightDrawer === 'zen_preview'
                  ? 'Canlı Evrensel Zen Modu Önizleme'
                  : 'Vaul Mühürleme & Arşiv Çekmecesi'}
              </span>
              <span className="text-xs font-bold text-stone-900">
                {activeDay.dayName} · {activeCell.slot} ({activeCell.time})
              </span>
            </div>
            <button
              type="button"
              onClick={() => onSetRightDrawer('none')}
              className="w-7 h-7 rounded-lg bg-white border border-stone-200 text-stone-500 hover:text-stone-900 flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {/* SEKME 1: HÜCRE MİKROSKOPU, PORSİYON ÇARPANI & AI TARİF MUTASYONU */}
            {rightDrawer === 'inspector' && (
              <>
                {activeCell.recipe && (
                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                    <div className="font-bold text-sm text-stone-900">
                      {activeCell.recipe.name}
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase text-stone-500 block mb-1.5">
                        Porsiyon Çarpanı ({activeCell.multiplier}x ·{' '}
                        {Math.round(activeCell.recipe.kcal * activeCell.multiplier)} kcal)
                      </span>
                      <div className="grid grid-cols-6 gap-1">
                        {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => onUpdateMultiplier(m)}
                            className={`py-1.5 rounded-lg font-bold border cursor-pointer ${
                              activeCell.multiplier === m
                                ? 'bg-teal-700 text-white border-teal-700'
                                : 'bg-white text-stone-700 border-stone-200'
                            }`}
                          >
                            {m}x
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-stone-200/80">
                      <span className="text-[10px] font-bold uppercase text-stone-500 block">
                        Tam Sayı Kuantize Edilmiş Mutfak Gramajları
                      </span>
                      {activeCell.recipe.ingredients.map((ing) => (
                        <div
                          key={ing.id}
                          className="p-2 rounded-lg bg-white border border-stone-200 font-semibold text-stone-800"
                        >
                          • {formatQuantizedIngredient(ing, activeCell.multiplier)}
                        </div>
                      ))}
                    </div>

                    {/* 2027 AI Tarif Mutasyonu */}
                    <div className="pt-2 border-t border-stone-200/80 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase text-purple-800 flex items-center gap-1">
                        <Wand2 className="w-3 h-3" /> Protokole Göre Akıllı Tarif Mutasyonu
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            onAssignRecipe(
                              mutateRecipeSafely(activeCell.recipe!, 'low_vit_k')
                            )
                          }
                          className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 font-bold text-left cursor-pointer"
                        >
                          🧬 Coumadin (Düşük K-Vit)
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onAssignRecipe(
                              mutateRecipeSafely(activeCell.recipe!, 'low_fiber_opu')
                            )
                          }
                          className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 font-bold text-left cursor-pointer"
                        >
                          🧬 IVF OPU (Düşük Lif)
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!veyaInput.trim()) return;
                    onAddExtraFood(veyaInput.trim(), 95, 5, 10, 4);
                    setVeyaInput('');
                  }}
                  className="p-3 rounded-2xl bg-stone-50 border border-stone-200 space-y-2"
                >
                  <label className="text-[10px] font-bold uppercase text-stone-600 block">
                    + Hücreye Serbest Besin veya &ldquo;VEYA&rdquo; Satırı Ekle
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={veyaInput}
                      onChange={(e) => setVeyaInput(e.target.value)}
                      placeholder="Örn: 1 Su Bardağı Kefir VEYA 4 yk Yoğurt"
                      className="flex-1 h-8 px-2.5 bg-white border border-stone-200 rounded-xl text-xs"
                    />
                    <button
                      type="submit"
                      className="h-8 px-3 rounded-xl bg-teal-700 text-white font-bold cursor-pointer"
                    >
                      Ekle
                    </button>
                  </div>
                </form>

                <div className="space-y-2">
                  <span className="font-bold text-stone-900 block">
                    Alternatif Reçete İle Değiştir
                  </span>
                  <input
                    type="text"
                    value={swapSearch}
                    onChange={(e) => setSwapSearch(e.target.value)}
                    placeholder="Alternatif ara..."
                    className="w-full h-8 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                  />
                  <div className="space-y-1.5">
                    {STUDIO_RECIPES.filter((r) =>
                      trLower(r.name).includes(trLower(swapSearch))
                    ).map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => onAssignRecipe(r)}
                        className="w-full p-2.5 rounded-xl bg-stone-50 hover:bg-teal-50 border border-stone-200 text-left flex items-center justify-between cursor-pointer"
                      >
                        <span className="font-bold text-stone-800 truncate pr-2">
                          {r.name}
                        </span>
                        <span className="font-bold text-teal-800 shrink-0">
                          {r.kcal} kcal
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* SEKME 2: CANLI EVRENSEL ZEN MODU ÖNİZLEME */}
            {rightDrawer === 'zen_preview' && (
              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200 text-teal-950">
                  <strong>AGENTS.md 9.1 · Evrensel Zen Modu:</strong> Danışanınız
                  mobil portalda hiçbir kalori/makro rakamı görmez; yalnızca aşağıdaki
                  mutfak gramajlarını görür.
                </div>
                <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200 text-sky-900 font-bold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Droplets className="w-4 h-4 text-sky-600" /> Günlük Su Hedefi:
                  </span>
                  <span>{waterLiters} Litre</span>
                </div>
                {activeDay.meals.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1"
                  >
                    <div className="font-bold text-teal-900">
                      {m.slot} ({m.time}): {m.recipe?.name}
                    </div>
                    {m.recipe?.ingredients.map((ing) => (
                      <div key={ing.id} className="text-stone-600">
                        • {formatQuantizedIngredient(ing, m.multiplier)}
                      </div>
                    ))}
                    {m.extraItems.map((ex) => (
                      <div key={ex.id} className="text-stone-700 font-medium">
                        + {ex.text}
                      </div>
                    ))}
                    {m.seedNote && (
                      <div className="text-[10px] font-bold text-purple-800">
                        {m.seedNote}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* SEKME 3: VAUL TESLİMAT, SHA-256 MÜHÜR & ARŞİV */}
            {rightDrawer === 'vaul_seal' && (
              <div className="space-y-4">
                {client.ivfStage === 'stage4_2ww' && (
                  <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-purple-950 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-purple-700 shrink-0" />
                    <div>
                      <div className="font-bold">
                        IVF 2WW · 14 Günlük Tartı Kilidi Aktif
                      </div>
                      <p className="text-purple-800">
                        Portalda tartı girişi 14 gün boyunca şefkatle kilitlenir.
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="font-bold text-stone-800 block">
                    Teslimat Paketi Başlığı
                  </label>
                  <input
                    type="text"
                    value={planTitle}
                    onChange={(e) => setPlanTitle(e.target.value)}
                    className="w-full h-9 px-3 bg-stone-50 border border-stone-200 rounded-xl font-semibold"
                  />
                  <label className="font-bold text-stone-800 block pt-1">
                    Danışan Karşılama Notu (Kalorisiz)
                  </label>
                  <textarea
                    rows={3}
                    value={welcomeNote}
                    onChange={(e) => setWelcomeNote(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => onSealPlan(planTitle, welcomeNote)}
                  className="w-full h-10 rounded-xl bg-[#00897b] hover:bg-[#00796b] text-white font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>SHA-256 İle Mühürle & Portala Gönder</span>
                </button>

                <div className="pt-3 border-t border-stone-200 space-y-2">
                  <div className="font-bold text-stone-800 flex items-center gap-1.5">
                    <History className="w-4 h-4 text-teal-700" />
                    <span>Geçmiş Mühürlü Planlar Arşivi ({sealedHistory.length})</span>
                  </div>
                  {sealedHistory.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-2"
                    >
                      <div>
                        <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-bold">
                          Versiyon #{rec.version} · #{rec.sha256}
                        </span>
                        <div className="font-bold text-stone-900 mt-0.5">
                          {rec.title}
                        </div>
                        <div className="text-[10px] text-stone-500">
                          {rec.sealedAt} · {rec.targetCalories} kcal
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRestorePlan(rec.days)}
                        className="px-2.5 py-1.5 rounded-lg bg-teal-700 text-white font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" /> Yükle
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SAĞ 48px SABİT DİKEY İKON RAYI */}
      <div className="w-12 bg-stone-50 border-l border-stone-200 flex flex-col items-center py-2.5 gap-2 shrink-0">
        <span className="text-[10px] font-extrabold text-purple-800 uppercase tracking-tighter">
          SAĞ
        </span>
        {rightRailItems.map((item) => {
          const Icon = item.icon;
          const active = rightDrawer === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSetRightDrawer(active ? 'none' : item.id)}
              title={item.label}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                active
                  ? 'bg-purple-700 text-white shadow-sm scale-105'
                  : 'bg-white border border-stone-200 text-stone-600 hover:border-purple-500 hover:text-purple-800'
              }`}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>
    </div>
  );
};