import React, { useState, useEffect } from 'react';
import { ORBIO_CLIENTS } from './data/orbioSeedData';
import { SealedPlanRecord, StudioDayColumn } from './types';
import {
  buildInitialWeeklyMatrix,
} from './services/clinicalEngine';
import { DietStudioCanvas } from './components/DietStudioCanvas';

export default function App() {
  const [selectedClientId, setSelectedClientId] = useState<string>(
    ORBIO_CLIENTS[0].id
  );
  const [workspaceMode, setWorkspaceMode] = useState<
    'diet_studio' | 'recipe_library' | 'pwa_simulator'
  >('diet_studio');
  const [safeShareActive, setSafeShareActive] = useState<boolean>(false);

  const activeClient =
    ORBIO_CLIENTS.find((c) => c.id === selectedClientId) || ORBIO_CLIENTS[0];

  const [daysMatrix, setDaysMatrix] = useState<StudioDayColumn[]>(() =>
    buildInitialWeeklyMatrix(ORBIO_CLIENTS[0])
  );
  const [sealedHistory, setSealedHistory] = useState<SealedPlanRecord[]>([]);

  useEffect(() => {
    setDaysMatrix(buildInitialWeeklyMatrix(activeClient));
  }, [activeClient.id]);

  useEffect(() => {
    if (safeShareActive) {
      document.body.classList.add('safe-share-active');
    } else {
      document.body.classList.remove('safe-share-active');
    }
  }, [safeShareActive]);

  return (
    <div className="h-screen w-screen bg-[#FAF8F5] text-stone-900 flex flex-col p-2 overflow-hidden">
      <main className="flex-1 w-full h-full min-h-0">
        <DietStudioCanvas
          client={activeClient}
          days={daysMatrix}
          setDays={setDaysMatrix}
          sealedHistory={sealedHistory}
          onSealNewPlan={(rec) =>
            setSealedHistory((prev) => [rec, ...prev])
          }
          workspaceMode={workspaceMode}
          onSetWorkspaceMode={setWorkspaceMode}
          safeShareActive={safeShareActive}
          onToggleSafeShare={() => setSafeShareActive((p) => !p)}
          onSelectClient={(id) => setSelectedClientId(id)}
        />
      </main>
    </div>
  );
}