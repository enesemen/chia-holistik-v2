import React, { useState } from 'react';
import {
  HeartPulse,
  Flame,
  Droplets,
  ChevronDown,
  ChevronUp,
  Send,
  Sparkles,
  Zap,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';
import { ORBIO_CLIENTS } from '../data/orbioSeedData';
import {
  BMRFormula,
  CollapsePresetMode,
  OrbioClientProfile,
  SemanticZoomMode,
  TopAccordionType,
} from '../types';

interface StudioTopAccordionProps {
  client: OrbioClientProfile;
  bmr: number;
  tdee: number;
  targetCalories: number;
  waterLiters: number;
  bmrFormula: BMRFormula;
  macroRatios: { p: number; c: number; f: number };
  collapsePreset: CollapsePresetMode;
  zoomMode: SemanticZoomMode;
  topAccordion: TopAccordionType;
  warningCount: number;
  onSetTopAccordion: (val: TopAccordionType) => void;
  onSetTargetCalories: (cal: number) => void;
  onSetBmrFormula: (f: BMRFormula) => void;
  onSetMacroRatios: (r: { p: number; c: number; f: number }) => void;
  onApplyCollapsePreset: (preset: CollapsePresetMode) => void;
  onSetZoomMode: (z: SemanticZoomMode) => void;
  onBalanceAllDays: () => void;
  onOpenVaulSealDrawer: () => void;
  onSelectClient?: (clientId: string) => void;
}

export const StudioTopAccordion: React.FC<StudioTopAccordionProps> = ({
  client,
  bmr,
  tdee,
  targetCalories,
  waterLiters,
  bmrFormula,
  macroRatios,
  collapsePreset,
  zoomMode,
  topAccordion,
  warningCount,
  onSetTopAccordion,
  onSetTargetCalories,
  onSetBmrFormula,
  onSetMacroRatios,
  onApplyCollapsePreset,
  onSetZoomMode,
  onBalanceAllDays,
  onOpenVaulSealDrawer,
  onSelectClient,
}) => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState(
    `${client.fullName} için 3 günlük tüketim karnesi (${client.threeDaySummary.avgKcal} kcal) ve biyokimya bulguları incelendi. ${client.threeDaySummary.insight}`
  );

  const pGrams = Math.round((targetCalories * (macroRatios.p / 100)) / 4);
  const cGrams = Math.round((targetCalories * (macroRatios.c / 100)) / 4);
  const fGrams = Math.round((targetCalories * (macroRatios.f / 100)) / 9);

  return (
    <div className="bg-white border-b border-stone-200 shrink-0 z-30">
      {/* 48px Kompakt Ana Komuta Satırı */}
      <div className="min-h-[48px] px-3.5 py-1.5 flex flex-wrap items-center justify-between gap-2">
        {/* SOL: Danışan Seçici + 2 Yatay Akordeon Tetikleyicisi */}
        <div className="flex flex-wrap items-center gap-2">
          {onSelectClient && (
            <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-xl px-2.5 h-8">
              <UserCheck className="w-3.5 h-3.5 text-teal-700 shrink-0" />
              <select
                value={client.id}
                onChange={(e) => onSelectClient(e.target.value)}
                className="bg-transparent text-xs font-bold text-stone-800 focus:outline-none cursor-pointer"
              >
                {ORBIO_CLIENTS.map((c) => (
                  <option key={c.id} value={c.id} className="text-stone-900">
                    {c.fullName.split(' (')[0]} ({c.weightKg}kg)
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="button"
            onClick={() =>
              onSetTopAccordion(
                topAccordion === 'clinical_bento' ? 'none' : 'clinical_bento'
              )
            }
            className={`h-8 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              topAccordion === 'clinical_bento'
                ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                : 'bg-stone-50 hover:bg-stone-100 text-stone-800 border-stone-200'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5 text-purple-500 shrink-0" />
            <span>{client.fullName}</span>
            <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-900 text-[10px] font-bold">
              Üst Çekmece: Karne & AI
            </span>
            {topAccordion === 'clinical_bento' ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            type="button"
            onClick={() =>
              onSetTopAccordion(
                topAccordion === 'macro_config' ? 'none' : 'macro_config'
              )
            }
            className={`h-8 px-3 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer safe-share-target ${
              topAccordion === 'macro_config'
                ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                : 'bg-stone-50 hover:bg-stone-100 text-stone-800 border-stone-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Hedef: {targetCalories} kcal</span>
            <span className="opacity-40">|</span>
            <span>
              %{macroRatios.p}P · %{macroRatios.c}K · %{macroRatios.f}Y
            </span>
            <span className="opacity-40">|</span>
            <span className="flex items-center gap-1 text-sky-700">
              <Droplets className="w-3 h-3" /> {waterLiters}L
            </span>
            {topAccordion === 'macro_config' ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* ORTA: 5+2 Esnek Akordeon Gün Modu Anahtarları */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200">
          {(
            [
              { id: '5+2', label: '📅 5+2 Hafta İçi Odak (Cmt-Paz Dar)' },
              { id: '2+5', label: '🌿 2+5 Hafta Sonu Odak' },
              { id: 'all', label: '🗓️ 7 Gün Tam Açık' },
            ] as const
          ).map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onApplyCollapsePreset(preset.id)}
              className={`h-6 px-2.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                collapsePreset === preset.id
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* SAĞ: Kart Yoğunluğu + Tüm Haftayı Dengele + Sağ Teslimat Çekmecesi */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-stone-100 p-0.5 rounded-xl border border-stone-200 text-[11px] font-bold">
            {(
              [
                { id: 'compact', label: 'Kompakt' },
                { id: 'kitchen', label: 'Gramajlı' },
                { id: 'xray', label: 'Röntgen' },
              ] as const
            ).map((z) => (
              <button
                key={z.id}
                type="button"
                onClick={() => onSetZoomMode(z.id)}
                className={`px-2 py-1 rounded-lg cursor-pointer ${
                  zoomMode === z.id
                    ? 'bg-teal-700 text-white'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {z.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onBalanceAllDays}
            className="h-8 px-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
            title="7 Günün tamamını hedef kaloriye otomatik kalibre et"
          >
            <Zap className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden xl:inline">Haftayı Dengele</span>
          </button>

          <button
            type="button"
            onClick={onOpenVaulSealDrawer}
            className="h-8 px-3.5 rounded-xl bg-[#00897b] hover:bg-[#00796b] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Mühürle & Teslim Et</span>
          </button>
        </div>
      </div>

      {/* ÜST AKORDEON PANEL 1: KLİNİK BENTO, TAHLİLLER, 3G KARNE & GEMINI 2.5 ASİSTAN */}
      {topAccordion === 'clinical_bento' && (
        <div className="p-3.5 bg-stone-50 border-t border-stone-200 grid grid-cols-1 lg:grid-cols-12 gap-3 animate-in fade-in duration-150">
          <div className="lg:col-span-7 bg-white p-3.5 rounded-2xl border border-stone-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-teal-600" /> Danışan Biyokimya, İlaç & 3 Günlük Tüketim Karnesi
              </span>
              <span className="text-xs font-bold text-amber-800">
                {warningCount} Aktif CDSS Uyarısı
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center bg-stone-50 p-2 rounded-xl border border-stone-200/80 text-xs safe-share-target">
              <div>
                <span className="text-[10px] text-stone-500 block font-bold">BMH ({bmrFormula === 'mifflin_st_jeor' ? 'Mifflin' : 'Harris'})</span>
                <strong className="text-stone-900">{bmr} kcal</strong>
              </div>
              <div>
                <span className="text-[10px] text-stone-500 block font-bold">TDEE</span>
                <strong className="text-stone-900">{tdee} kcal</strong>
              </div>
              <div>
                <span className="text-[10px] text-stone-500 block font-bold">3G GÜNLÜK ORT.</span>
                <strong className="text-amber-800">{client.threeDaySummary.avgKcal} kcal</strong>
              </div>
              <div>
                <span className="text-[10px] text-stone-500 block font-bold">SU HEDEFİ (33ml/kg)</span>
                <strong className="text-sky-800">{waterLiters} L</strong>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 text-xs">
              {client.diagnoses.map((d) => (
                <span key={d} className="px-2 py-0.5 rounded-lg bg-teal-50 text-teal-900 border border-teal-200 font-bold">
                  {d}
                </span>
              ))}
              {client.medications.map((m) => (
                <span key={m} className="px-2 py-0.5 rounded-lg bg-purple-50 text-purple-900 border border-purple-200 font-bold">
                  💊 {m}
                </span>
              ))}
              {client.allergies.map((a) => (
                <span key={a} className="px-2 py-0.5 rounded-lg bg-rose-50 text-rose-900 border border-rose-200 font-bold">
                  🚫 Alerji: {a}
                </span>
              ))}
            </div>

            <div className="p-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 safe-share-target">
              <strong>Mahrem Klinik Not:</strong> {client.privateClinicalNote} (Seans Ücreti: ₺{client.sessionFeeTl})
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#0a2e26] text-white p-3.5 rounded-2xl flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Gemini 2.5 Klinik Karar Asistanı
              </span>
              <button
                type="button"
                onClick={() => onSetTopAccordion('none')}
                className="text-[11px] font-bold text-emerald-200 hover:text-white cursor-pointer"
              >
                Kapat ▲
              </button>
            </div>
            <p className="text-xs text-emerald-100/95 leading-relaxed">{aiResponse}</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!aiPrompt.trim()) return;
                setAiResponse(
                  `"${aiPrompt}" için Klinik Yanıt: ${client.fullName} protokolünde akşam glisemik yükünü düşürmek için kinoa/bulgur porsiyonunu öğleye kaydırıp akşam fırın balık/hindi + zeytinyağlı kabak vermeniz önerilir.`
                );
                setAiPrompt('');
              }}
              className="flex gap-1.5"
            >
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Klinik asistana protokol veya besin ikamesi danışın..."
                className="flex-1 h-8 px-3 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder:text-emerald-200/50 focus:outline-none"
              />
              <button
                type="submit"
                className="h-8 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs cursor-pointer"
              >
                Sor
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ÜST AKORDEON PANEL 2: KALORİ ARKETİPİ, BMH FORMÜLÜ & MAKRO SLIDER */}
      {topAccordion === 'macro_config' && (
        <div className="p-3.5 bg-stone-50 border-t border-stone-200 grid grid-cols-1 lg:grid-cols-12 gap-4 animate-in fade-in duration-150 text-xs safe-share-target">
          <div className="lg:col-span-6 bg-white p-3.5 rounded-2xl border border-stone-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-800">1. Kalori Arketipi & BMH Formülü</span>
              <div className="flex gap-1 bg-stone-100 p-0.5 rounded-lg">
                {(['mifflin_st_jeor', 'harris_benedict'] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => onSetBmrFormula(f)}
                    className={`px-2.5 py-1 rounded-md font-bold cursor-pointer ${
                      bmrFormula === f ? 'bg-white text-teal-800 shadow-2xs' : 'text-stone-600'
                    }`}
                  >
                    {f === 'mifflin_st_jeor' ? 'Mifflin-St Jeor' : 'Harris-Benedict'}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {[1200, 1400, 1600, 1750, 1900, 2100].map((cal) => (
                <button
                  key={cal}
                  type="button"
                  onClick={() => onSetTargetCalories(cal)}
                  className={`py-1.5 rounded-xl font-bold border cursor-pointer ${
                    targetCalories === cal
                      ? 'bg-teal-700 text-white border-teal-700'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {cal}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 bg-white p-3.5 rounded-2xl border border-stone-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-800">
                2. Makro Oranı ({pGrams}g P · {cGrams}g KH · {fGrams}g Y)
              </span>
              <button
                type="button"
                onClick={() => onSetTopAccordion('none')}
                className="font-bold text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                Kapat ▲
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Dengeli Akdeniz (%22P/%48K/%30Y)', p: 22, c: 48, f: 30 },
                { label: 'PMOS İnsülin Kalkanı (%25P/%40K/%35Y)', p: 25, c: 40, f: 35 },
                { label: 'Düşük Karb / Keto (%25P/%20K/%55Y)', p: 25, c: 20, f: 55 },
              ].map((m) => (
                <button
                  key={m.label}
                  type="button"
                  onClick={() => onSetMacroRatios({ p: m.p, c: m.c, f: m.f })}
                  className={`p-2 rounded-xl border text-left font-bold cursor-pointer ${
                    macroRatios.p === m.p && macroRatios.c === m.c
                      ? 'bg-purple-50 border-purple-400 text-purple-950'
                      : 'bg-stone-50 border-stone-200 text-stone-700'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};