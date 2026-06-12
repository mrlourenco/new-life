import { useState } from 'react'
import { usePlans, useLogs, useActiveWorkout, useExerciseHistory } from './hooks/useStore'
import { useMealTemplates, useNutritionLogs, useNutritionPlans } from './hooks/useNutritionStore'
import BottomNav, { type Tab } from './components/BottomNav'
import ActiveWorkoutView from './components/ActiveWorkoutView'
import TodayPage from './pages/TodayPage'
import HistoryPage from './pages/HistoryPage'
import PlansPage from './pages/PlansPage'
import NutritionPage from './pages/NutritionPage'
import type { WorkoutPlan, WorkoutSession, ActiveWorkout } from './types/workout'

const TODAY = new Date().toISOString().slice(0, 10)

export default function App() {
  const [tab, setTab] = useState<Tab>('today')
  const [showActive, setShowActive] = useState(false)

  // Workout
  const { plans, addPlan, deletePlan } = usePlans()
  const { logs, addLog, deleteLog } = useLogs()
  const { active, startWorkout, updateActive, clearActive } = useActiveWorkout()
  const exerciseHistory = useExerciseHistory(logs)

  // Nutrition
  const { templates, saveTemplate, deleteTemplate, importTemplates } = useMealTemplates()
  const { logs: nutritionLogs, saveLog: saveNutritionLog, deleteLog: deleteNutritionLog } = useNutritionLogs()
  const { plans: nutritionPlans, savePlan, deletePlan: deletePlanN, setActivePlan } = useNutritionPlans()

  const handleStart = (plan: WorkoutPlan, session: WorkoutSession) => {
    const now = new Date().toISOString()
    const workout: ActiveWorkout = {
      log: {
        id: crypto.randomUUID(),
        session_id: session.id,
        plan_id: plan.id,
        session_name: session.name,
        date: now.slice(0, 10),
        started_at: now,
        exercises: session.exercises.map(ex => ({
          exercise_id: ex.id,
          exercise_name: ex.name,
          muscle: ex.muscle,
          notes: ex.notes,
          sets: Array.from({ length: ex.sets }, (_, i) => ({
            set_number: i + 1,
            reps_target: ex.reps,
            completed: false,
          })),
        })),
      },
      session,
      current_exercise_index: 0,
    }
    startWorkout(workout)
    setShowActive(true)
  }

  const handleFinish = (workout: ActiveWorkout) => {
    addLog(workout.log)
    clearActive()
    setShowActive(false)
    setTab('history')
  }

  const handleDiscard = () => {
    if (confirm('Descartar o treino em curso? O progresso será perdido.')) {
      clearActive()
      setShowActive(false)
    }
  }

  if (showActive && active) {
    return (
      <div className="h-full flex flex-col">
        <ActiveWorkoutView
          active={active}
          onUpdate={updateActive}
          onFinish={handleFinish}
          onDiscard={handleDiscard}
          exerciseHistory={exerciseHistory}
        />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col max-w-md mx-auto">
      <main className="flex-1 flex flex-col overflow-hidden">
        {tab === 'today' && (
          <TodayPage plans={plans} active={active} onStart={handleStart} onResume={() => setShowActive(true)} />
        )}
        {tab === 'history' && (
          <HistoryPage logs={logs} onDelete={deleteLog} />
        )}
        {tab === 'plans' && (
          <PlansPage plans={plans} onAdd={addPlan} onDelete={deletePlan} />
        )}
        {tab === 'nutrition' && (
          <NutritionPage
            today={TODAY}
            templates={templates}
            logs={nutritionLogs}
            plans={nutritionPlans}
            onSaveLog={saveNutritionLog}
            onDeleteLog={deleteNutritionLog}
            onSaveTemplate={saveTemplate}
            onDeleteTemplate={deleteTemplate}
            onImportTemplates={importTemplates}
            onSavePlan={savePlan}
            onDeletePlan={deletePlanN}
            onActivatePlan={setActivePlan}
          />
        )}
      </main>
      <BottomNav tab={tab} onChange={setTab} hasActive={!!active} />
    </div>
  )
}
