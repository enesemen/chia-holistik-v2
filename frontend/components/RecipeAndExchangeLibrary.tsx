import React, { useState } from 'react';
import {
  ChefHat,
  Database,
  Layers,
  Search,
  Clock,
  Package,
  Home,
  Flame,
} from 'lucide-react';
import {
  STUDIO_RECIPES,
  TDD_EXCHANGE_RULES,
  TURKOMP_FOODS,
} from '../data/orbioSeedData';
import { trLower } from '../services/clinicalEngine';

export const RecipeAndExchangeLibrary: React.FC = () => {
  const [subTab, setSubTab] = useState<'recipes' | 'turkomp' | 'exchanges'>('recipes');
  const [search, setSearch] = useState('');
  const q = trLower(search);

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-2xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-200">
        <div>
          <h2 className="text-base font-extrabold text-stone-900">
            Klinik Tarif, TürKomp 100g & TDD Değişim Kütüphanesi
          </h2>
          <p className="text-xs text-stone-500">
            Üç katmanlı deterministik besin ve reçete referans veritabanı
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setSubTab('recipes')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer ${
              subTab === 'recipes' ? 'bg-teal-700 text-white' : 'text-stone-600'
            }`}
          >
            <ChefHat className="w-3.5 h-3.5" /> Klinik Reçeteler ({STUDIO_RECIPES.length})
          </button>
          <button
            type="button"
            onClick={() => setSubTab('turkomp')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer ${
              subTab === 'turkomp' ? 'bg-teal-700 text-white' : 'text-stone-600'
            }`}
          >
            <Database className="w-3.5 h-3.5" /> TürKomp 100g ({TURKOMP_FOODS.length})
          </button>
          <button
            type="button"
            onClick={() => setSubTab('exchanges')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer ${
              subTab === 'exchanges' ? 'bg-purple-700 text-white' : 'text-stone-600'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> TDD Değişim Sistemi ({TDD_EXCHANGE_RULES.length})
          </button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Reçete, TürKomp kodu veya değişim eşdeğeri ara..."
          className="w-full h-9 pl-10 pr-4 bg-stone-50 border border-stone-200 rounded-xl text-xs"
        />
      </div>

      {subTab === 'recipes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {STUDIO_RECIPES.filter((r) =>
            trLower(`${r.name} ${r.family} ${r.category}`).includes(q)
          ).map((r) => (
            <div
              key={r.id}
              className="p-4 rounded-2xl bg-stone-50/70 border border-stone-200 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-teal-800">
                  <span>{r.category} · {r.family}</span>
                  <span className="flex items-center gap-1 text-stone-500">
                    <Clock className="w-3 h-3" /> {r.prepMinutes} dk
                  </span>
                </div>
                <h3 className="text-sm font-bold text-stone-900">{r.name}</h3>
                <p className="text-xs text-stone-600 leading-relaxed">{r.clinicalNote}</p>
                <div className="pt-1 space-y-0.5">
                  {r.ingredients.map((i) => (
                    <div key={i.id} className="text-[11px] text-stone-700">
                      • {i.amount} {i.unit} {i.name} ({i.grams}g)
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2.5 border-t border-stone-200/80 flex items-center justify-between text-xs safe-share-target">
                <span className="font-bold text-stone-700">{r.exchanges}</span>
                <span className="font-bold text-teal-800 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-500" /> {r.kcal} kcal
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {subTab === 'turkomp' && (
        <div className="overflow-x-auto rounded-xl border border-stone-200">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-[10px] font-bold uppercase text-stone-500">
              <tr>
                <th className="p-3">Kod</th>
                <th className="p-3">Besin Adı</th>
                <th className="p-3">Standart Ev Ölçüsü</th>
                <th className="p-3">Enerji</th>
                <th className="p-3">Protein / Karb / Yağ / Lif</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {TURKOMP_FOODS.filter((f) =>
                trLower(`${f.name} ${f.code}`).includes(q)
              ).map((f) => (
                <tr key={f.id} className="hover:bg-stone-50">
                  <td className="p-3 font-mono font-bold text-purple-700">{f.code}</td>
                  <td className="p-3 font-bold text-stone-900">{f.name}</td>
                  <td className="p-3 text-stone-600">{f.measure} ({f.grams}g)</td>
                  <td className="p-3 font-bold text-teal-800">{f.kcal} kcal</td>
                  <td className="p-3 text-stone-600">
                    {f.p}g P · {f.c}g K · {f.f}g Y · {f.fiber}g Lif
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {subTab === 'exchanges' && (
        <div className="overflow-x-auto rounded-xl border border-stone-200">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-[10px] font-bold uppercase text-stone-500">
              <tr>
                <th className="p-3">Besin & Grup</th>
                <th className="p-3">1 Değişim Porsiyonu</th>
                <th className="p-3">Çiğ / Pişmiş Net</th>
                <th className="p-3">Klinik Eşdeğer Alternatifler</th>
                <th className="p-3">Klinik Fonksiyon Notu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {TDD_EXCHANGE_RULES.filter((ex) =>
                trLower(`${ex.name} ${ex.group} ${ex.equivalents}`).includes(q)
              ).map((ex) => (
                <tr key={ex.id} className="hover:bg-stone-50">
                  <td className="p-3">
                    <div className="font-bold text-stone-900">{ex.name}</div>
                    <div className="text-[10px] text-stone-500">{ex.group}</div>
                  </td>
                  <td className="p-3 font-bold text-teal-800">{ex.portion}</td>
                  <td className="p-3 font-mono text-stone-700">{ex.stateNote}</td>
                  <td className="p-3 text-stone-700">{ex.equivalents}</td>
                  <td className="p-3 text-stone-500 italic">{ex.clinicalNote}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};