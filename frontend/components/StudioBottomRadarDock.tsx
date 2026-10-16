import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShoppingCart,
  ChevronUp,
  ChevronDown,
  Copy,
  Wand2,
} from 'lucide-react';
import { BottomDrawerType, MealSlotType } from '../types';

export interface WeeklyWarningItem {
  dayIndex: number;
  dayName: string;
  mealId: string;
  slot: MealSlotType;
  warningTitle: string;
  message: string;
  fixRecipeId: string;
  fixName: string;
}

interface StudioBottomRadarDockProps {
  activeDayName: string;
  activeSlotName: string;
  activeDayKcal: number;
  targetCalories: number;
  bottomDrawer: BottomDrawerType;
  warnings: WeeklyWarningItem[];
  groceryList: Array<{ name: string; totalGrams: number; category: string }>;
  onSetBottomDrawer: (val: BottomDrawerType) => void;
  onRunOmnibarCommand: (cmd: string) => void;
  onApplyQuickFix: (dayIdx: number, mealId: string, fixRecipeId: string) => void;
}

export const StudioBottomRadarDock: React.FC<StudioBottomRadarDockProps> = ({
  activeDayName,
  activeSlotName,
  activeDayKcal,
  targetCalories,
  bottomDrawer,
  warnings,
  groceryList,
  onSetBottomDrawer,
  onRunOmnibarCommand,
  onApplyQuickFix,
}) => {
  const [commandText, setCommandText] = useState('');

  return (
    <div className="bg-white border-t border-stone-200 shrink-0 z-30">
      {/* YUKARI AÇILAN ALT AKORDEON (CDSS UYARI RADARI VEYA MARKET LİSTESİ) */}
      {bottomDrawer !== 'none' && (
        <div className="p-3.5 bg-stone-50 border-b border-stone-200 max-h-52 overflow-y-auto animate-in slide-in-from-bottom-2 duration-150 text-xs">
          {bottomDrawer === 'cdss_radar' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-950 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>
                    Alt Çekmece · Haftalık CDSS İlaç-Besin & IVF Uyarı Radarı ({warnings.length})
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => onSetBottomDrawer('none')}
                  className="font-bold text-stone-500 cursor-pointer"
                >
                  Kapat ▼
                </button>
              </div>

              {warnings.length === 0 ? (
                <div className="p-2.5 rounded-xl bg-white border border-stone-200 text-teal-800 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  Tüm 7 günlük matriste hiçbir CDSS ilaç-besin veya IVF çakışması bulunmuyor!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  {warnings.map((w, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white border border-amber-300 shadow-2xs flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-amber-800 uppercase block">
                          {w.dayName} · {w.slot}
                        </span>
                        <strong className="text-stone-900 truncate block">
                          {w.warningTitle}
                        </strong>
                        <span className="text-[11px] text-stone-600 truncate block">
                          {w.message}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          onApplyQuickFix(w.dayIndex, w.mealId, w.fixRecipeId)
                        }
                        className="px-2.5 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <Wand2 className="w-3 h-3" />
                        <span>Çöz: {w.fixName}</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {bottomDrawer === 'grocery_list' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900 flex items-center gap-1.5">
                  <ShoppingCart className="w-4 h-4 text-teal-700" />
                  <span>
                    Alt Çekmece · 7 Günlük Birleştirilmiş Market Listesi ({groceryList.length} Kalem)
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      groceryList
                        .map((g) => `• ${g.name}: ${g.totalGrams}g`)
                        .join('\n')
                    );
                  }}
                  className="px-3 py-1 rounded-lg bg-white border border-stone-200 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" /> Panoya Kopyala
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {groceryList.map((g) => (
                  <div
                    key={g.name}
                    className="p-2 rounded-lg bg-white border border-stone-200 truncate"
                  >
                    <strong className="text-stone-900 block truncate">{g.name}</strong>
                    <span className="text-teal-800 font-bold">
                      {g.totalGrams}g toplam
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 44px SABİT ALT TELEMETRİ, DOĞAL DİL AI OMNIBAR & ÇEKMECE BUTONLARI */}
      <div className="min-h-[44px] px-3.5 py-1 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs font-bold text-stone-700 flex items-center gap-2 shrink-0 safe-share-target">
          <CheckCircle2 className="w-4 h-4 text-teal-600" />
          <span>
            Seçili: {activeDayName} ({activeSlotName}) · {activeDayKcal} / {targetCalories} kcal
          </span>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!commandText.trim()) return;
            onRunOmnibarCommand(commandText);
            setCommandText('');
          }}
          className="flex-1 max-w-md flex items-center gap-1.5"
        >
          <div className="relative flex-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-600 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={commandText}
              onChange={(e) => setCommandText(e.target.value)}
              placeholder='AI Omnibar: "Salı akşamına somon koy ve tüm haftayı 1650 kcal dengele"...'
              className="w-full h-8 pl-8 pr-3 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-purple-600"
            />
          </div>
          <button
            type="submit"
            className="h-8 px-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold cursor-pointer shrink-0"
          >
            Uygula
          </button>
        </form>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() =>
              onSetBottomDrawer(
                bottomDrawer === 'cdss_radar' ? 'none' : 'cdss_radar'
              )
            }
            className={`h-8 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
              warnings.length > 0
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : 'bg-stone-50 border-stone-200 text-stone-700'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Alt Çekmece: CDSS Radar ({warnings.length})</span>
            {bottomDrawer === 'cdss_radar' ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            type="button"
            onClick={() =>
              onSetBottomDrawer(
                bottomDrawer === 'grocery_list' ? 'none' : 'grocery_list'
              )
            }
            className="h-8 px-3 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-xs font-bold text-stone-700 flex items-center gap-1.5 cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-teal-700" />
            <span>Market ({groceryList.length})</span>
          </button>
        </div>
      </div>
    </div>
  );
};