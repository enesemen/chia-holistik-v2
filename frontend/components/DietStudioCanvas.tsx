import React, { useState, useMemo, useEffect } from 'react';
import {
  Building2,
  Home,
  Zap,
  ChevronLeft,
  ChevronRight,
  Stamp,
  CopyCheck,
  Sliders,
  Lock,
  Unlock,
  Trash2,
  AlertTriangle,
  Wand2,
  CheckCircle2,
} from 'lucide-react';
import {
  BMRFormula,
  BottomDrawerType,
  CollapsePresetMode,
  LeftDrawerType,
  OrbioClientProfile,
  RightDrawerType,
  SealedPlanRecord,
  SemanticZoomMode,
  StudioDayColumn,
  StudioMealCell,
  StudioRecipeItem,
  TopAccordionType,
} from '../types';
import { STUDIO_RECIPES } from '../data/orbioSeedData';
import {
  buildInitialWeeklyMatrix,
  calculateCellMacros,
  calculateClientEnergyAndWater,
  calculateDayTotals,
  evaluateCellCdssAlerts,
  formatQuantizedIngredient,
  trLower,
} from '../services/clinicalEngine';
import { StudioTopAccordion } from './StudioTopAccordion';
import {
  StudioLeftArsenalDrawer,
  StudioRightInspectorDrawer,
} from './StudioSideDrawers';
import { StudioBottomRadarDock, WeeklyWarningItem } from './StudioBottomRadarDock';
import { RecipeAndExchangeLibrary } from './RecipeAndExchangeLibrary';
import { ClientPwaZenSimulator } from './ClientPwaZenSimulator';

interface DietStudioCanvasProps {
  client: OrbioClientProfile;
  days: StudioDayColumn[];
  setDays: React.Dispatch<React.SetStateAction<StudioDayColumn[]>>;
  sealedHistory: SealedPlanRecord[];
  onSealNewPlan: (record: SealedPlanRecord) => void;
  workspaceMode: 'diet_studio' | 'recipe_library' | 'pwa_simulator';
  onSetWorkspaceMode: (mode: 'diet_studio' | 'recipe_library' | 'pwa_simulator') => void;
  safeShareActive: boolean;
  onToggleSafeShare: () => void;
  onSelectClient?: (clientId: string) => void;
}

export const DietStudioCanvas: React.FC<DietStudioCanvasProps> = ({
  client,
  days,
  setDays,
  sealedHistory,
  onSealNewPlan,
  workspaceMode,
  onSetWorkspaceMode,
  safeShareActive,
  onToggleSafeShare,
  onSelectClient,
}) => {
  const [bmrFormula, setBmrFormula] = useState<BMRFormula>('mifflin_st_jeor');
  const energyWater = useMemo(
    () => calculateClientEnergyAndWater(client, bmrFormula),
    [client, bmrFormula]
  );

  const [targetCalories, setTargetCalories] = useState<number>(
    energyWater.recommendedKcal
  );
  const [macroRatios, setMacroRatios] = useState({ p: 25, c: 45, f: 30 });
  const [collapsePreset, setCollapsePreset] = useState<CollapsePresetMode>('5+2');
  const [zoomMode, setZoomMode] = useState<SemanticZoomMode>('kitchen');

  // 4-YÖNLÜ MANYETİK KOKPİT ÇEKMECE DURUMLARI
  const [topAccordion, setTopAccordion] = useState<TopAccordionType>('none');
  const [leftDrawer, setLeftDrawer] = useState<LeftDrawerType>('none');
  const [rightDrawer, setRightDrawer] = useState<RightDrawerType>('none');
  const [bottomDrawer, setBottomDrawer] = useState<BottomDrawerType>('none');

  const [selectedCoord, setSelectedCoord] = useState<{
    dayIndex: number;
    mealId: string;
  }>({
    dayIndex: 0,
    mealId: 'cell_0_Kahvaltı',
  });
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    setTargetCalories(energyWater.recommendedKcal);
  }, [energyWater.recommendedKcal, client.id]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  const activeDay = days[selectedCoord.dayIndex] || days[0];
  const activeCell =
    activeDay.meals.find((m) => m.id === selectedCoord.mealId) || activeDay.meals[0];

  // Tüm haftadaki CDSS uyarıları
  const allWarnings = useMemo(() => {
    const list: WeeklyWarningItem[] = [];
    days.forEach((d) =>
      d.meals.forEach((m) => {
        const alerts = evaluateCellCdssAlerts(m, client);
        alerts.forEach((a) =>
          list.push({
            dayIndex: d.dayIndex,
            dayName: d.dayName,
            mealId: m.id,
            slot: m.slot,
            warningTitle: a.title,
            message: a.message,
            fixRecipeId: a.fixRecipeId,
            fixName: a.fixName,
          })
        );
      })
    );
    return list;
  }, [days, client]);

  // Haftalık Birleştirilmiş Market Listesi
  const groceryList = useMemo(() => {
    const map = new Map<string, { name: string; totalGrams: number; category: string }>();
    days.forEach((d) =>
      d.meals.forEach((m) => {
        if (!m.recipe) return;
        m.recipe.ingredients.forEach((ing) => {
          const g = Math.round(ing.grams * m.multiplier);
          const cur = map.get(ing.name);
          if (cur) cur.totalGrams += g;
          else map.set(ing.name, { name: ing.name, totalGrams: g, category: ing.category });
        });
      })
    );
    return Array.from(map.values());
  }, [days]);

  const handleApplyCollapsePreset = (preset: CollapsePresetMode) => {
    setCollapsePreset(preset);
    setDays((prev) =>
      prev.map((d, idx) => ({
        ...d,
        isCollapsed:
          preset === '5+2' ? idx >= 5 : preset === '2+5' ? idx < 5 : false,
      }))
    );
  };

  const toggleSingleDayCollapse = (dayIdx: number) => {
    setCollapsePreset('custom');
    setDays((prev) =>
      prev.map((d, idx) =>
        idx === dayIdx ? { ...d, isCollapsed: !d.isCollapsed } : d
      )
    );
  };

  const assignRecipeToCell = (
    dayIdx: number,
    mealId: string,
    recipe: StudioRecipeItem
  ) => {
    setDays((prev) =>
      prev.map((d, idx) =>
        idx !== dayIdx
          ? d
          : {
              ...d,
              meals: d.meals.map((m) =>
                m.id === mealId ? { ...m, recipe, multiplier: 1.0 } : m
              ),
            }
      )
    );
    showToast(`✓ "${recipe.name}" ${days[dayIdx].dayName} öğününe atandı.`);
  };

  const updateCellMultiplier = (dayIdx: number, mealId: string, nextMult: number) => {
    const clamped = Math.max(0.5, Math.min(2.5, Number(nextMult.toFixed(2))));
    setDays((prev) =>
      prev.map((d, idx) =>
        idx !== dayIdx
          ? d
          : {
              ...d,
              meals: d.meals.map((m) =>
                m.id === mealId ? { ...m, multiplier: clamped } : m
              ),
            }
      )
    );
  };

  const balanceSingleDay = (dayIdx: number) => {
    setDays((prev) =>
      prev.map((d, idx) => {
        if (idx !== dayIdx) return d;
        const curKcal = calculateDayTotals(d).kcal;
        if (curKcal <= 0) return d;
        const ratio = targetCalories / curKcal;
        return {
          ...d,
          meals: d.meals.map((m) =>
            m.isPinned
              ? m
              : {
                  ...m,
                  multiplier: Math.max(
                    0.5,
                    Math.min(2.0, Math.round(m.multiplier * ratio * 4) / 4)
                  ),
                }
          ),
        };
      })
    );
    showToast(`⚡ ${days[dayIdx].dayName} günü ${targetCalories} kcal hedefine dengelendi.`);
  };

  const balanceAllDays = () => {
    days.forEach((_, idx) => balanceSingleDay(idx));
    showToast(`⚡ Tüm 7 gün ${targetCalories} kcal (±%5) hedefine dengelendi!`);
  };

  const cloneMealToWeekdays = (sourceCell: StudioMealCell) => {
    setDays((prev) =>
      prev.map((d, idx) =>
        idx >= 5
          ? d
          : {
              ...d,
              meals: d.meals.map((m) =>
                m.slot === sourceCell.slot
                  ? {
                      ...m,
                      recipe: sourceCell.recipe,
                      multiplier: sourceCell.multiplier,
                      extraItems: [...sourceCell.extraItems],
                    }
                  : m
              ),
            }
      )
    );
    showToast(`🖌️ ${sourceCell.slot} öğünü Pazartesi–Cuma (5 gün) boyunca kopyalandı!`);
  };

  const carryOverBatchToNextLunch = (dayIdx: number, cell: StudioMealCell) => {
    if (!cell.recipe) return;
    const nextIdx = (dayIdx + 1) % 7;
    setDays((prev) =>
      prev.map((d, idx) => {
        if (idx === dayIdx) {
          return {
            ...d,
            meals: d.meals.map((m) =>
              m.id === cell.id
                ? { ...m, batchNote: '🍲 2 Porsiyon pişirilecek (Yarın öğleye ayrıldı)' }
                : m
            ),
          };
        }
        if (idx === nextIdx) {
          return {
            ...d,
            meals: d.meals.map((m) =>
              m.slot === 'Öğle'
                ? {
                    ...m,
                    isPinned: true,
                    recipe: cell.recipe,
                    multiplier: cell.multiplier,
                    batchNote: `🍲 ${days[dayIdx].dayName} akşamından hazır 2. porsiyon`,
                  }
                : m
            ),
          };
        }
        return d;
      })
    );
    showToast(`🍲 Batch Cooking: ${days[nextIdx].dayName} Öğle öğününe bağlandı!`);
  };

  return (
    <div className="bg-white border border-stone-200 rounded-2xl shadow-sm flex flex-col h-full min-h-0 overflow-hidden relative select-none">
      {toastMsg && (
        <div className="fixed bottom-16 right-6 z-50 px-4 py-2.5 bg-stone-900 text-white rounded-xl shadow-xl border border-stone-700 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. ÜST KENAR: 48px KOMUTA BARI + AÇILIR/KAPANIR YATAY AKORDEON */}
      {workspaceMode === 'diet_studio' && (
        <StudioTopAccordion
          client={client}
          bmr={energyWater.bmr}
          tdee={energyWater.tdee}
          targetCalories={targetCalories}
          waterLiters={energyWater.waterLiters}
          bmrFormula={bmrFormula}
          macroRatios={macroRatios}
          collapsePreset={collapsePreset}
          zoomMode={zoomMode}
          topAccordion={topAccordion}
          warningCount={allWarnings.length}
          onSetTopAccordion={(val) => {
            setTopAccordion(val);
            if (val !== 'none') {
              setLeftDrawer('none');
              setRightDrawer('none');
              setBottomDrawer('none');
            }
          }}
          onSetTargetCalories={setTargetCalories}
          onSetBmrFormula={setBmrFormula}
          onSetMacroRatios={setMacroRatios}
          onApplyCollapsePreset={handleApplyCollapsePreset}
          onSetZoomMode={setZoomMode}
          onBalanceAllDays={balanceAllDays}
          onOpenVaulSealDrawer={() => {
            setRightDrawer('vaul_seal');
            setLeftDrawer('none');
            setTopAccordion('none');
          }}
          onSelectClient={onSelectClient}
        />
      )}

      {/* 2. ORTA GÖVDE: SOL ÇEKMECE RAYI + (5+2 ESNEK GÜN MATRİSİ VEYA DİĞER MODÜLLER) */}
      <div className="flex-1 flex min-h-0 relative overflow-hidden">
        {/* SOL KENAR ÇEKMECESİ */}
        <StudioLeftArsenalDrawer
          leftDrawer={leftDrawer}
          activeDayName={activeDay.dayName}
          activeSlotName={activeCell.slot}
          onSetLeftDrawer={(val) => {
            setLeftDrawer(val);
            if (val !== 'none') {
              setRightDrawer('none');
              setTopAccordion('none');
            }
          }}
          onAssignRecipe={(rec) =>
            assignRecipeToCell(selectedCoord.dayIndex, selectedCoord.mealId, rec)
          }
          onAddExtraFood={(text, kcal, p, c, f) => {
            setDays((prev) =>
              prev.map((d, i) =>
                i !== selectedCoord.dayIndex
                  ? d
                  : {
                      ...d,
                      meals: d.meals.map((m) =>
                        m.id !== selectedCoord.mealId
                          ? m
                          : {
                              ...m,
                              extraItems: [
                                ...m.extraItems,
                                { id: `ex_${Date.now()}`, text, kcal, p, c, f },
                              ],
                            }
                      ),
                    }
              )
            );
            showToast(`+ "${text}" eklendi.`);
          }}
          workspaceMode={workspaceMode}
          onSetWorkspaceMode={onSetWorkspaceMode}
          safeShareActive={safeShareActive}
          onToggleSafeShare={onToggleSafeShare}
        />

        {workspaceMode === 'diet_studio' && (
          <>
            {/* ORTA ALAN: 5+2 ESNEK AKORDEON GÜN SÜTUNLARI */}
            <div className="flex-1 overflow-x-auto overflow-y-auto bg-stone-100/80 p-2.5 flex gap-2 min-w-0">
              {days.map((dayCol) => {
                const dayTotals = calculateDayTotals(dayCol);
                const diffPct = Math.round(
                  ((dayTotals.kcal - targetCalories) / targetCalories) * 100
                );
                const isOk = Math.abs(diffPct) <= 6;

                // DARALTILMIŞ DİKEY GÜN ŞERİDİ (52px)
                if (dayCol.isCollapsed) {
                  return (
                    <div
                      key={dayCol.dayName}
                      onClick={() => toggleSingleDayCollapse(dayCol.dayIndex)}
                      onDragEnter={() => toggleSingleDayCollapse(dayCol.dayIndex)}
                      title={`${dayCol.dayName} sütununu genişletmek için tıklayın`}
                      className="w-[52px] shrink-0 bg-white hover:bg-teal-50/60 border border-stone-200/90 hover:border-teal-600 rounded-2xl p-2 flex flex-col items-center justify-between cursor-pointer transition-all shadow-2xs"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center">
                          <ChevronRight className="w-4 h-4" />
                        </span>
                        <span className="text-[10px] font-bold">
                          {dayCol.isOfficeDay ? '🏢' : '🏠'}
                        </span>
                        <span className="writing-vertical text-xs font-extrabold tracking-widest text-stone-800 py-2 uppercase">
                          {dayCol.dayName}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        {dayCol.meals.map((m) => (
                          <span
                            key={m.id}
                            className={`w-2.5 h-2.5 rounded-full ${
                              evaluateCellCdssAlerts(m, client).length > 0
                                ? 'bg-amber-500'
                                : m.recipe
                                ? 'bg-teal-600'
                                : 'bg-stone-300'
                            }`}
                          />
                        ))}
                      </div>

                      <div className="text-center safe-share-target">
                        <div
                          className={`text-[10px] font-bold px-1 py-0.5 rounded ${
                            isOk ? 'bg-teal-50 text-teal-800' : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {dayTotals.kcal}
                        </div>
                      </div>
                    </div>
                  );
                }

                // AÇIK GÜN SÜTUNU (Hafta İçi 5 Gün Yan Yana Geniş!)
                return (
                  <div
                    key={dayCol.dayName}
                    className="flex-1 min-w-[232px] bg-stone-50/95 border border-stone-200/90 rounded-2xl flex flex-col justify-between shadow-2xs"
                  >
                    <div className="p-2.5 bg-white rounded-t-2xl border-b border-stone-200/80 space-y-1.5">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h3 className="text-sm font-extrabold text-stone-900 truncate">
                            {dayCol.dayName}
                          </h3>
                          <button
                            type="button"
                            onClick={() =>
                              setDays((prev) =>
                                prev.map((d, i) =>
                                  i === dayCol.dayIndex
                                    ? { ...d, isOfficeDay: !d.isOfficeDay }
                                    : d
                                )
                              )
                            }
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border flex items-center gap-1 cursor-pointer ${
                              dayCol.isOfficeDay
                                ? 'bg-teal-50 text-teal-800 border-teal-200'
                                : 'bg-stone-100 text-stone-600 border-stone-200'
                            }`}
                          >
                            {dayCol.isOfficeDay ? (
                              <>
                                <Building2 className="w-3 h-3" /> Ofis
                              </>
                            ) : (
                              <>
                                <Home className="w-3 h-3" /> Ev
                              </>
                            )}
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => balanceSingleDay(dayCol.dayIndex)}
                            title="Bu günü hedef kaloriye otomatik dengele"
                            className="w-6 h-6 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 flex items-center justify-center cursor-pointer"
                          >
                            <Zap className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleSingleDayCollapse(dayCol.dayIndex)}
                            title="Bu günü daralt (Akordeon)"
                            className="w-6 h-6 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs tabular-nums safe-share-target">
                        <span className="font-bold text-stone-800">
                          {dayTotals.kcal} / {targetCalories} kcal
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            isOk
                              ? 'bg-teal-50 text-teal-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {diffPct > 0 ? `+${diffPct}%` : `${diffPct}%`}
                        </span>
                      </div>
                    </div>

                    {/* Öğün Kartları */}
                    <div className="p-2 space-y-2 flex-1">
                      {dayCol.meals.map((cell) => {
                        const isSelected =
                          selectedCoord.dayIndex === dayCol.dayIndex &&
                          selectedCoord.mealId === cell.id;
                        const cTotals = calculateCellMacros(cell);
                        const cellAlerts = evaluateCellCdssAlerts(cell, client);

                        return (
                          <div
                            key={cell.id}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.preventDefault();
                              const recId = e.dataTransfer.getData('text/orbio-recipe-id');
                              const found = STUDIO_RECIPES.find((r) => r.id === recId);
                              if (found) assignRecipeToCell(dayCol.dayIndex, cell.id, found);
                            }}
                            onClick={() =>
                              setSelectedCoord({
                                dayIndex: dayCol.dayIndex,
                                mealId: cell.id,
                              })
                            }
                            className={`group rounded-xl border p-2.5 transition-all cursor-pointer space-y-1.5 ${
                              cellAlerts.length > 0
                                ? 'bg-amber-50/80 border-amber-300'
                                : isSelected
                                ? 'bg-white border-teal-600 ring-2 ring-teal-600/15 shadow-xs'
                                : 'bg-white border-stone-200/90 hover:border-stone-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-stone-900">
                                  {cell.slot}
                                </span>
                                <span className="text-[10px] font-semibold text-stone-400">
                                  {cell.time}
                                </span>
                              </div>

                              <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100">
                                <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                cloneMealToWeekdays(cell);
                              }}
                              title="Öğün Fırçası: Bu öğünü Pzt-Cum 5 güne kopyala"
                              className="w-6 h-6 rounded-md text-stone-500 hover:text-teal-700 hover:bg-teal-50 flex items-center justify-center cursor-pointer"
                            >
                              <Stamp className="w-3.5 h-3.5" />
                            </button>

                            {cell.slot === 'Akşam' && cell.recipe && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  carryOverBatchToNextLunch(dayCol.dayIndex, cell);
                                }}
                                title="Batch Cooking: Ertesi gün öğleye 2. porsiyon olarak ata"
                                className="w-6 h-6 rounded-md text-stone-500 hover:text-purple-700 hover:bg-purple-50 flex items-center justify-center cursor-pointer"
                              >
                                <CopyCheck className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCoord({
                                  dayIndex: dayCol.dayIndex,
                                  mealId: cell.id,
                                });
                                setRightDrawer('inspector');
                              }}
                              title="Sağ Hücre Mikroskopu & Porsiyon Çekmecesini Aç"
                              className="w-6 h-6 rounded-md text-stone-500 hover:text-teal-700 hover:bg-teal-50 flex items-center justify-center cursor-pointer"
                            >
                              <Sliders className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDays((prev) =>
                                  prev.map((d, i) =>
                                    i !== dayCol.dayIndex
                                      ? d
                                      : {
                                          ...d,
                                          meals: d.meals.map((m) =>
                                            m.id === cell.id
                                              ? { ...m, isPinned: !m.isPinned }
                                              : m
                                          ),
                                        }
                                  )
                                );
                              }}
                              className={`w-6 h-6 rounded-md flex items-center justify-center cursor-pointer ${
                                cell.isPinned
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'text-stone-400 hover:text-stone-700'
                              }`}
                            >
                              {cell.isPinned ? (
                                <Lock className="w-3 h-3" />
                              ) : (
                                <Unlock className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>

                        {cell.recipe ? (
                          <div className="space-y-1">
                            <div className="flex items-start justify-between gap-1">
                              <span className="text-xs font-bold text-teal-900 leading-snug">
                                {cell.recipe.name}
                              </span>
                              {cell.multiplier !== 1 && (
                                <span className="px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-bold shrink-0">
                                  {cell.multiplier}x
                                </span>
                              )}
                            </div>

                            {zoomMode === 'kitchen' && (
                              <ul className="space-y-0.5 pl-1">
                                {cell.recipe.ingredients.map((ing) => (
                                  <li
                                    key={ing.id}
                                    className="text-[11px] text-stone-600 leading-snug"
                                  >
                                    • {formatQuantizedIngredient(ing, cell.multiplier)}
                                  </li>
                                ))}
                              </ul>
                            )}

                            {zoomMode === 'xray' && (
                              <div className="p-1.5 rounded-lg bg-stone-50 border border-stone-200 text-[10px] font-bold text-stone-700 space-y-0.5 safe-share-target">
                                <div>Değişim: {cell.recipe.exchanges}</div>
                                <div className="text-purple-800">
                                  Lif: {cell.recipe.fiber}g ·{' '}
                                  {cell.recipe.isWarm ? '🔥 Sıcak/Ilık' : '❄️ Soğuk'}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-stone-400 py-1">
                            Sol çekmeceden tarif seçin
                          </div>
                        )}

                        {cell.extraItems.map((ex) => (
                          <div
                            key={ex.id}
                            className="px-2 py-1 rounded-lg bg-stone-50 border border-stone-200/80 text-[11px] font-semibold text-stone-800 flex items-center justify-between"
                          >
                            <span className="truncate">+ {ex.text}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDays((prev) =>
                                  prev.map((d, i) =>
                                    i !== dayCol.dayIndex
                                      ? d
                                      : {
                                          ...d,
                                          meals: d.meals.map((m) =>
                                            m.id !== cell.id
                                              ? m
                                              : {
                                                  ...m,
                                                  extraItems: m.extraItems.filter(
                                                    (x) => x.id !== ex.id
                                                  ),
                                                }
                                          ),
                                        }
                                  )
                                );
                              }}
                              className="text-stone-400 hover:text-rose-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}

                        {cell.seedNote && (
                          <div className="px-2 py-0.5 rounded bg-purple-50 text-purple-900 border border-purple-200 text-[10px] font-bold">
                            {cell.seedNote}
                          </div>
                        )}
                        {cell.batchNote && (
                          <div className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-900 border border-indigo-200 text-[10px] font-bold">
                            {cell.batchNote}
                          </div>
                        )}
                        {cell.zeroWasteNote && (
                          <div className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200 text-[10px] font-bold">
                            {cell.zeroWasteNote}
                          </div>
                        )}

                        {cellAlerts.map((al) => (
                          <div
                            key={al.id}
                            className="p-1.5 rounded-lg bg-amber-100/90 border border-amber-300 text-amber-950 space-y-1"
                          >
                            <div className="flex items-center gap-1 text-[10px] font-bold">
                              <AlertTriangle className="w-3 h-3 text-amber-700 shrink-0" />
                              <span className="truncate">{al.title}</span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const safeRec = STUDIO_RECIPES.find(
                                  (r) => r.id === al.fixRecipeId
                                );
                                if (safeRec)
                                  assignRecipeToCell(dayCol.dayIndex, cell.id, safeRec);
                              }}
                              className="w-full py-1 px-2 rounded bg-white hover:bg-teal-50 text-teal-900 border border-amber-300 text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Wand2 className="w-3 h-3 text-teal-700" />
                              <span>⚡ Değiştir: {al.fixName}</span>
                            </button>
                          </div>
                        ))}

                        <div className="pt-1.5 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500 tabular-nums safe-share-target">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateCellMultiplier(
                                  dayCol.dayIndex,
                                  cell.id,
                                  cell.multiplier - 0.25
                                );
                              }}
                              className="w-5 h-5 rounded bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold flex items-center justify-center cursor-pointer"
                            >
                              -
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateCellMultiplier(
                                  dayCol.dayIndex,
                                  cell.id,
                                  cell.multiplier + 0.25
                                );
                              }}
                              className="w-5 h-5 rounded bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold flex items-center justify-center cursor-pointer"
                            >
                              +
                            </button>
                            <span className="font-bold text-stone-800 ml-1">
                              {cTotals.kcal} kcal
                            </span>
                          </div>
                          <span>
                            {cTotals.p}P · {cTotals.c}K · {cTotals.f}Y
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* SAĞ KENAR ÇEKMECESİ */}
        <StudioRightInspectorDrawer
          rightDrawer={rightDrawer}
          client={client}
          activeDay={activeDay}
          activeCell={activeCell}
          allDays={days}
          targetCalories={targetCalories}
          waterLiters={energyWater.waterLiters}
          sealedHistory={sealedHistory}
          onSetRightDrawer={(val) => {
            setRightDrawer(val);
            if (val !== 'none') {
              setLeftDrawer('none');
              setTopAccordion('none');
            }
          }}
          onUpdateMultiplier={(mult) =>
            updateCellMultiplier(activeDay.dayIndex, activeCell.id, mult)
          }
          onAssignRecipe={(rec) =>
            assignRecipeToCell(activeDay.dayIndex, activeCell.id, rec)
          }
          onAddExtraFood={(text, kcal, p, c, f) => {
            setDays((prev) =>
              prev.map((d, i) =>
                i !== activeDay.dayIndex
                  ? d
                  : {
                      ...d,
                      meals: d.meals.map((m) =>
                        m.id !== activeCell.id
                          ? m
                          : {
                              ...m,
                              extraItems: [
                                ...m.extraItems,
                                { id: `ex_${Date.now()}`, text, kcal, p, c, f },
                              ],
                            }
                      ),
                    }
              )
            );
          }}
          onSealPlan={(title, note) => {
            const newRec: SealedPlanRecord = {
              id: `seal_${Date.now()}`,
              version: sealedHistory.length + 1,
              title,
              sealedAt: new Date().toLocaleString('tr-TR'),
              sha256: Math.random().toString(16).slice(2, 12),
              targetCalories,
              waterLiters: energyWater.waterLiters,
              welcomeLetter: note,
              scaleLockedFor14Days: client.ivfStage === 'stage4_2ww',
              days: JSON.parse(JSON.stringify(days)),
            };
            onSealNewPlan(newRec);
            setRightDrawer('none');
            showToast('🚀 Plan SHA-256 ile mühürlendi ve Danışan Portalına (PWA) gönderildi!');
          }}
          onRestorePlan={(restoredDays) => {
            setDays(JSON.parse(JSON.stringify(restoredDays)));
            setRightDrawer('none');
            showToast('✓ Geçmiş arşiv planı tuvale geri yüklendi.');
          }}
        />
        </>
      )}

      {workspaceMode === 'recipe_library' && (
        <div className="flex-1 overflow-y-auto p-4 bg-[#FAF8F5]">
          <RecipeAndExchangeLibrary />
        </div>
      )}

      {workspaceMode === 'pwa_simulator' && (
        <div className="flex-1 overflow-y-auto p-4 bg-[#FAF8F5] flex items-center justify-center">
          <ClientPwaZenSimulator
            client={client}
            days={days}
            waterLiters={energyWater.waterLiters}
          />
        </div>
      )}
      </div>

      {/* 3. ALT KENAR: 44px DOĞAL DİL OMNIBAR + AÇILIR/KAPANIR ALT RADAR & MARKET ÇEKMECESİ */}
      {workspaceMode === 'diet_studio' && (
        <StudioBottomRadarDock
          activeDayName={activeDay.dayName}
          activeSlotName={activeCell.slot}
          activeDayKcal={calculateDayTotals(activeDay).kcal}
          targetCalories={targetCalories}
          bottomDrawer={bottomDrawer}
          warnings={allWarnings}
          groceryList={groceryList}
          onSetBottomDrawer={(val) => {
            setBottomDrawer(val);
            if (val !== 'none') setTopAccordion('none');
          }}
          onRunOmnibarCommand={(cmd) => {
            const norm = trLower(cmd);
            const calMatch = norm.match(/(\d{4})/);
            if (calMatch) setTargetCalories(Number(calMatch[1]));
            if (norm.includes('somon')) {
              const somon = STUDIO_RECIPES.find((r) => r.id === 'rec_somon_firin')!;
              assignRecipeToCell(1, 'cell_1_Akşam', somon);
            }
            balanceAllDays();
          }}
          onApplyQuickFix={(dIdx, mId, fixId) => {
            const safeRec = STUDIO_RECIPES.find((r) => r.id === fixId);
            if (safeRec) assignRecipeToCell(dIdx, mId, safeRec);
          }}
        />
      )}
    </div>
  );
};