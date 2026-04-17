"use client";
import { useFireStore } from "@/lib/store";
import { NumberField } from "@/components/ui/NumberField";
import { User, Calendar, Clock } from "lucide-react";

export function StepYou() {
  const { inputs, updateInputs } = useFireStore();

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
          hint="Your age today"
        />
        <NumberField
          label="Target retirement age"
          icon={<Calendar className="w-4 h-4" />}
          value={inputs.retirementAge}
          onChange={(v) => updateInputs({ retirementAge: v })}
          min={inputs.currentAge + 1}
          max={80}
          suffix="years"
          hint="When you want to stop working"
        />
        <NumberField
          label="Life expectancy"
          icon={<Clock className="w-4 h-4" />}
          value={inputs.lifeExpectancy}
          onChange={(v) => updateInputs({ lifeExpectancy: v })}
          min={inputs.retirementAge + 1}
          max={110}
          suffix="years"
          hint="Planning horizon — use 90+ to be safe"
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
    </div>
  );
}
