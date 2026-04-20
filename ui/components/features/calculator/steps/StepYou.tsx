"use client";
import { useFireStore } from "@/lib/store";
import { useValidationErrors } from "@/lib/ValidationContext";
import { NumberField } from "@/components/ui/NumberField";
import { User, Calendar, Clock, Users } from "lucide-react";

export function StepYou() {
  const { inputs, updateInputs, includeSpouse, setIncludeSpouse, spouseInputs, updateSpouseInputs } = useFireStore();
  const errors = useValidationErrors();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">About you</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Your age and retirement timeline set the foundation for everything.
        </p>
      </div>

      <div className="grid gap-4">
        <NumberField
          label="Current age"
          icon={<User className="w-4 h-4" />}
          value={inputs.currentAge}
          onChange={(v) => updateInputs({ currentAge: v })}
          min={18}
          max={80}
          suffix="years"
          placeholder="e.g. 30"
          hint="Your age today"
          error={errors.currentAge}
        />
        <NumberField
          label="Target retirement age"
          icon={<Calendar className="w-4 h-4" />}
          value={inputs.retirementAge}
          onChange={(v) => updateInputs({ retirementAge: v })}
          min={inputs.currentAge + 1}
          max={80}
          suffix="years"
          placeholder="e.g. 50"
          hint="When you want to stop working"
          error={errors.retirementAge}
        />
        <NumberField
          label="Life expectancy"
          icon={<Clock className="w-4 h-4" />}
          value={inputs.lifeExpectancy}
          onChange={(v) => updateInputs({ lifeExpectancy: v })}
          min={inputs.retirementAge + 1}
          max={110}
          suffix="years"
          placeholder="e.g. 90"
          hint="Planning horizon — use 90+ to be safe"
          error={errors.lifeExpectancy}
        />
      </div>

      {/* Summary */}
      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Years until retirement</span>
            <p className="font-semibold text-foreground mt-0.5">
              {Math.max(0, inputs.retirementAge - inputs.currentAge)} years
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Retirement duration</span>
            <p className="font-semibold text-foreground mt-0.5">
              {Math.max(0, inputs.lifeExpectancy - inputs.retirementAge)} years
            </p>
          </div>
        </div>
      </div>

      {/* Spouse / partner toggle */}
      <div className="rounded-xl border border-border overflow-hidden">
        <button
          onClick={() => setIncludeSpouse(!includeSpouse)}
          className="w-full flex items-center justify-between px-4 py-3 bg-muted/20 hover:bg-muted/40 transition-colors text-left"
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <Users className="w-4 h-4 text-primary" />
            Include spouse / partner
          </span>
          <div
            className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${
              includeSpouse ? "bg-primary" : "bg-muted-foreground/30"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                includeSpouse ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </div>
        </button>

        {includeSpouse && (
          <div className="px-4 pb-4 pt-2 space-y-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground pt-1">
              You&apos;ll get separate FIRE plans for each of you, plus a unified household view.
            </p>
            <NumberField
              label="Spouse's current age"
              icon={<User className="w-4 h-4" />}
              value={spouseInputs.currentAge}
              onChange={(v) => updateSpouseInputs({ currentAge: v })}
              min={18}
              max={80}
              suffix="years"
              placeholder="e.g. 28"
              error={errors.spouseCurrentAge}
            />
            <NumberField
              label="Spouse's target retirement age"
              icon={<Calendar className="w-4 h-4" />}
              value={spouseInputs.retirementAge}
              onChange={(v) => updateSpouseInputs({ retirementAge: v })}
              min={spouseInputs.currentAge + 1}
              max={80}
              suffix="years"
              placeholder="e.g. 52"
              error={errors.spouseRetirementAge}
            />
            <NumberField
              label="Spouse's life expectancy"
              icon={<Clock className="w-4 h-4" />}
              value={spouseInputs.lifeExpectancy}
              onChange={(v) => updateSpouseInputs({ lifeExpectancy: v })}
              min={spouseInputs.retirementAge + 1}
              max={110}
              suffix="years"
              placeholder="e.g. 90"
              error={errors.spouseLifeExpectancy}
            />
          </div>
        )}
      </div>
    </div>
  );
}
