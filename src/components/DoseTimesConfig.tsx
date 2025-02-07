'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  type DoseTime, 
  type MedicationConfig, 
  calculateTaperMetrics,
} from '@/lib/taper-calculations';

interface DoseTimesConfigProps {
  config: MedicationConfig;
  onConfigChange: (config: MedicationConfig) => void;
}

const DoseTimesConfig: React.FC<DoseTimesConfigProps> = ({
  config,
  onConfigChange,
}) => {
  const metrics = calculateTaperMetrics(config);

  const addDoseTime = () => {
    onConfigChange({
      ...config,
      doseTimes: [
        ...config.doseTimes,
        { 
          time: "12:00", 
          initialDose: 10, 
          includeZeroDoses: false,
          daysPerStep: 7 
        }
      ]
    });
  };

  const removeDoseTime = (index: number) => {
    onConfigChange({
      ...config,
      doseTimes: config.doseTimes.filter((_, i) => i !== index)
    });
  };

  const updateDoseTime = (index: number, field: keyof DoseTime, value: string | number | boolean) => {
    onConfigChange({
      ...config,
      doseTimes: config.doseTimes.map((dose, i) =>
        i === index ? { ...dose, [field]: value } : dose
      )
    });
  };

  return (
    <div className="space-y-6">
      {/* Daily Doses Configuration */}
      <div className="space-y-4">
        <h3 className="font-medium">Daily Doses:</h3>
        
        {config.doseTimes.map((dose, index) => (
          <div key={index} className="grid grid-cols-5 gap-4 items-end bg-background p-4 rounded-lg border">
            <div>
              <label className="block text-sm font-medium mb-2">Time:</label>
              <input
                type="time"
                className="w-full border rounded p-2"
                value={dose.time}
                onChange={(e) => updateDoseTime(index, 'time', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Initial Dose:</label>
              <input
                type="number"
                className="w-full border rounded p-2"
                value={dose.initialDose}
                onChange={(e) => updateDoseTime(index, 'initialDose', parseFloat(e.target.value) || 0)}
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Days per Step:</label>
              <input
                type="number"
                className="w-full border rounded p-2"
                value={dose.daysPerStep}
                onChange={(e) => updateDoseTime(index, 'daysPerStep', Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Include Zero Doses:</label>
              <input
                type="checkbox"
                className="border rounded p-2"
                checked={dose.includeZeroDoses}
                onChange={(e) => updateDoseTime(index, 'includeZeroDoses', e.target.checked)}
              />
            </div>
            <Button
              onClick={() => removeDoseTime(index)}
              variant="destructive"
              disabled={config.doseTimes.length <= 1}
            >
              Remove
            </Button>
          </div>
        ))}

        <Button
          onClick={addDoseTime}
          variant="default"
          size="default"
          className="ml-0"
        >
          Add Dose Time
        </Button>
      </div>

      {/* Schedule Overview */}
      <div className="bg-secondary/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Taper Schedule Overview</h3>
        <p className="text-md mb-6">Total duration: <span className="font-medium">{metrics.totalDays} days</span></p>
        
        {metrics.doseTimeSchedules.map((schedule, index) => (
          <div key={index} className="mb-6 last:mb-0">
            <h4 className="text-md font-medium mb-3">{schedule.time} dose:</h4>
            <div className="pl-4 space-y-2">
              <div className="font-mono bg-background/50 p-3 rounded-md">
                {schedule.steps.map(s => `${s.toFixed(1)}${config.unit}`).join(' → ')}
              </div>
              <p>Duration: <span className="font-medium">{schedule.duration} days</span> ({schedule.steps.length} steps)</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoseTimesConfig;