import { useState } from 'react'
import { usePlans, useLogs, useActiveWorkout, useExerciseHistory } from './hooks/useStore'
import { useMealTemplates, useNutritionLogs, useNutritionPlans } from './hooks/useNutritionStore'
import { useWeekAssignments } from './hooks/useWeekAssignments'
import { useWorkoutWeekAssignments } from './hooks/useWorkoutWeek'
import { useProfileStore } from './hooks/useProfileStore'
import { useToday } from './hooks/useToday'
import { localISODate } from './utils/dates'
import BottomNav, { type Tab } from './components/BottomNav'
import ActiveWorkoutView from './components/ActiveWorkoutView'
import WorkoutPage, { type WorkoutTab } from './pages/WorkoutPage'
import NutritionPage from './pages/NutritionPage'
import ProfilePage from './pages/ProfilePage'
import type { WorkoutPlan, WorkoutSession, ActiveWorkout } from './types/workout'

export default function App() {
  const today = useToday()
  const [tab, setTab] = useState<Tab>('workout')
  const [workoutTab, setWorkoutTab] = useState<WorkoutTab>('hoje')
  const [showActive, setShowActive] = useState(false)

  // Workout
  const { plans, addPlan, deletePlan } = usePlans()
  const { logs, addLog, updateLog, deleteLog } = useLogs()
  const { active, startWorkout, updateActive, clearActive } = useActiveWorkout()
  const { assignments: workoutAssignments, assignPlanToWeek: assignWorkoutPlan, saveDayOverride: saveWorkoutDayOverride } = useWorkoutWeekAssignments()
  const exerciseHistory = useExerciseHistory(logs)

  // Nutrition
  const { templates, saveTemplate, deleteTemplate, importTemplates } = useMealTemplates()
  const { logs: nutritionLogs, saveLog: saveNutritionLog, deleteLog: deleteNutritionLog } = useNutritionLogs()
  const { plans: nutritionPlans, savePlan, deletePlan: deletePlanN } = useNutritionPlans()
  const { assignments, assignPlanToWeek, saveDayOverride } = useWeekAssignments()
  const { profile, saveMacroTargets, saveWeekStartDay, addWeightEntry, deleteWeightEntry } = useProfileStore()

  const handleStart = (plan: WorkoutPlan, session: WorkoutSession) => {
    const now = new Date().toISOString()
    const workout: ActiveWorkout = {
      log: {
        id: crypto.randomUUID(),
        session_id: session.id,
        plan_id: plan.id,
        session_name: session.name,
        date: localISODate(),
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
    setTab('workout')
    setWorkoutTab('historico')
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
        {tab === 'workout' && (
          <WorkoutPage
            tab={workoutTab}
            onTabChange={setWorkoutTab}
            today={today}
            weekStartDay={profile.week_start_day}
            plans={plans}
            active={active}
            logs={logs}
            assignments={workoutAssignments}
            onStart={handleStart}
            onResume={() => setShowActive(true)}
            onAddPlan={addPlan}
            onDeletePlan={deletePlan}
            onUpdateLog={updateLog}
            onDeleteLog={deleteLog}
            onAssignPlan={assignWorkoutPlan}
            onSaveDayOverride={saveWorkoutDayOverride}
          />
        )}
        {tab === 'nutrition' && (
          <NutritionPage
            today={today}
            templates={templates}
            logs={nutritionLogs}
            plans={nutritionPlans}
            assignments={assignments}
            macroTargets={profile.macro_targets}
            weekStartDay={profile.week_start_day}
            onSaveLog={saveNutritionLog}
            onSaveTemplate={saveTemplate}
            onDeleteTemplate={deleteTemplate}
            onImportTemplates={importTemplates}
            onSavePlan={savePlan}
            onDeletePlan={deletePlanN}
            onAssignPlan={assignPlanToWeek}
            onSaveDayOverride={saveDayOverride}
          />
        )}
        {tab === 'profile' && (
          <ProfilePage
            macroTargets={profile.macro_targets}
            weightEntries={profile.weight_entries}
            weekStartDay={profile.week_start_day}
            nutritionLogs={nutritionLogs}
            nutritionPlans={nutritionPlans}
            today={today}
            onSaveMacroTargets={saveMacroTargets}
            onSaveWeekStartDay={saveWeekStartDay}
            onAddWeightEntry={addWeightEntry}
            onDeleteWeightEntry={deleteWeightEntry}
            onDeleteNutritionLog={deleteNutritionLog}
          />
        )}
      </main>
      <BottomNav tab={tab} onChange={setTab} hasActive={!!active} />
    </div>
  )
}
