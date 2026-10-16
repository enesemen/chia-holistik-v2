import React, { useState } from 'react';
import {
  Droplets,
  Scale,
  Clock,
  CheckCircle2,
  ArrowLeftRight,
  HeartHandshake,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { OrbioClientProfile, StudioDayColumn } from '../types';
import { formatQuantizedIngredient } from '../services/clinicalEngine';
import { TDD_EXCHANGE_RULES } from '../data/orbioSeedData';

interface ClientPwaZenSimulatorProps {
  client: OrbioClientProfile;
  days: StudioDayColumn[];
  waterLiters: number;
}

const COMPLIANCE_TIERS = [
  { id: 'full', label: '🌿 Plana Uygun' },
  { id: 'swap', label: '🔄 Mutfak Takası' },
  { id: 'half', label: '🥣 Hafif Porsiyon' },
  { id: 'rest', label: '🌸 Öğün Dinlenmesi' },
  { id: 'joy', label: '✨ Keyif Öğünü' },
];

export const ClientPwaZenSimulator: React.FC<ClientPwaZenSimulatorProps> = ({
  client,
  days,
  waterLiters,
}) => {
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [pwaTab, setPwaTab] = useState<'menu' | 'exchanges'>('menu');
  const [complianceMap, setComplianceMap] = useState<Record<string, string>>({});

  const activeDay = days[selectedDayIdx] || days[0];

  return (
    <div className="max-w-md mx-auto bg-[#FAF8F5] border-[6px] border-stone-900 rounded-[40px] shadow-2xl overflow-hidden min-h-[760px] flex flex-col">
      <div className="bg-stone-900 text-white px-5 py-3 flex items-center justify-between text-xs">
        <span className="font-bold">📱 {client.fullName.split(' ')[0]} · Orbio PWA</span>
        <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold">
          Evrensel Zen Modu (0 Kalori)
        </span>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-3.5 text-xs">
        {/* Şefkat Dili Kan Tahlili Özeti (AGENTS.md 9.6) */}
        <div className="bg-teal-50/80 border border-teal-200 rounded-3xl p-4 space-y-1.5">
          <div className="font-bold text-teal-900 flex items-center gap-1.5">
            <HeartHandshake className="w-4 h-4 text-teal-700" />
            <span>Diyetisyeninizin Biyokimya & Şefkat Notu</span>
          </div>
          <p className="text-stone-700 leading-relaxed flex items-start gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
            <span>
              Demir ve D vitamini depolarınızı öğünlerinizdeki C vitamini ve sağlıklı
              yağ eşlikçileriyle nazikçe destekliyoruz. 🌿
            </span>
          </p>
        </div>

        {/* Su Hedefi & 2WW Tartı Molası */}
        <div className="bg-white rounded-3xl border border-stone-200 p-4 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-teal-700">
                Aktif Beslenme Planım
              </span>
              <h3 className="text-sm font-bold text-stone-900">{client.fullName}</h3>
            </div>
            <span className="px-3 py-1.5 rounded-2xl bg-sky-50 border border-sky-200 font-bold text-sky-900 flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-sky-600" /> Su: {waterLiters} L
            </span>
          </div>

          {client.ivfStage === 'stage4_2ww' && (
            <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 text-purple-950 flex items-center gap-2">
              <Scale className="w-4 h-4 text-purple-700 shrink-0" />
              <span>
                <strong>🌸 14 Günlük Tartı Molası Aktif:</strong> Bedeniniz dinlenmede;
                tartı rakamlarına odaklanmadan öğünlerinizin keyfini çıkarın.
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPwaTab('menu')}
              className={`min-h-[44px] rounded-2xl font-bold cursor-pointer ${
                pwaTab === 'menu'
                  ? 'bg-teal-700 text-white'
                  : 'bg-stone-100 text-stone-700'
              }`}
            >
              📅 Günlük Menüm
            </button>
            <button
              type="button"
              onClick={() => setPwaTab('exchanges')}
              className={`min-h-[44px] rounded-2xl font-bold flex items-center justify-center gap-1 cursor-pointer ${
                pwaTab === 'exchanges'
                  ? 'bg-purple-700 text-white'
                  : 'bg-stone-100 text-stone-700'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" /> Mutfak Değişimleri
            </button>
          </div>
        </div>

        {pwaTab === 'menu' ? (
          <>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {days.map((d, idx) => (
                <button
                  key={d.dayName}
                  type="button"
                  onClick={() => setSelectedDayIdx(idx)}
                  className={`min-h-[40px] px-3.5 rounded-2xl font-bold shrink-0 cursor-pointer ${
                    selectedDayIdx === idx
                      ? 'bg-stone-900 text-white'
                      : 'bg-white border border-stone-200 text-stone-600'
                  }`}
                >
                  {d.dayName.slice(0, 3)}
                </button>
              ))}
            </div>

            {activeDay.meals.map((meal) => {
              const selectedTier = complianceMap[meal.id];
              return (
                <div
                  key={meal.id}
                  className="bg-white rounded-3xl border border-stone-200 p-4 space-y-2.5 shadow-2xs"
                >
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <span className="font-bold text-sm text-stone-900 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-teal-700" />
                      {meal.slot} ({meal.time})
                    </span>
                    <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md">
                      Gramaj Açık · Kalori Gizli
                    </span>
                  </div>

                  {meal.recipe && (
                    <div className="space-y-1">
                      <div className="font-bold text-teal-900">{meal.recipe.name}</div>
                      <ul className="space-y-0.5 text-stone-700">
                        {meal.recipe.ingredients.map((ing) => (
                          <li key={ing.id}>
                            • {formatQuantizedIngredient(ing, meal.multiplier)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {meal.extraItems.map((ex) => (
                    <div key={ex.id} className="font-semibold text-stone-800">
                      + {ex.text}
                    </div>
                  ))}

                  {meal.seedNote && (
                    <div className="p-2 rounded-xl bg-purple-50 text-purple-900 font-bold text-[11px]">
                      {meal.seedNote}
                    </div>
                  )}

                  {/* 5 Kademeli Guilt-Free Öğün Uyum Takibi */}
                  <div className="pt-2 border-t border-stone-100 grid grid-cols-3 gap-1">
                    {COMPLIANCE_TIERS.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() =>
                          setComplianceMap((p) => ({ ...p, [meal.id]: t.id }))
                        }
                        className={`min-h-[38px] px-2 rounded-xl font-bold text-[10px] border cursor-pointer ${
                          selectedTier === t.id
                            ? 'bg-teal-700 text-white border-teal-700'
                            : 'bg-stone-50 text-stone-700 border-stone-200'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            <div className="p-3 rounded-2xl bg-white border border-stone-200 flex items-center justify-between text-[10px] text-stone-500">
              <span className="font-bold text-teal-800 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Uzm. Dyt. Zeynep Onaylı Program
              </span>
              <span className="font-mono">SHA-256 Mühürlü</span>
            </div>
          </>
        ) : (
          <div className="space-y-2.5">
            {TDD_EXCHANGE_RULES.map((ex) => (
              <div
                key={ex.id}
                className="bg-white rounded-2xl border border-stone-200 p-3.5 space-y-1"
              >
                <div className="font-bold text-teal-900">
                  {ex.name} — {ex.portion}
                </div>
                <p className="text-stone-700">
                  <strong>Alternatif:</strong> {ex.equivalents}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};