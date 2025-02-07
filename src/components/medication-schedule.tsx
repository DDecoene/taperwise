'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { generateMedicationICS, downloadICSFile } from '@/lib/calendar-utils';
import { 
  type DoseTime, 
  type MedicationConfig, 
  type ScheduleEvent,
  generateSchedule
} from '@/lib/taper-calculations';

const DEFAULT_CONFIG: MedicationConfig = {
  name: "Medication",
  unit: "mg",
  form: "pill",
  strengthPerUnit: 5,
  doseTimes: [
    { time: "08:00", initialDose: 10, reductionRate: 10, includeZeroDoses: false },
    { time: "20:00", initialDose: 10, reductionRate: 15, includeZeroDoses: false }
  ]
};

const MedicationSchedule = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [config, setConfig] = useState<MedicationConfig>(DEFAULT_CONFIG);
  const [schedule, setSchedule] = useState<ScheduleEvent[]>([]);
  const [showConfig, setShowConfig] = useState(true);

  const updateSchedule = useCallback(() => {
    const newSchedule = generateSchedule(startDate, config);
    setSchedule(newSchedule);
  }, [startDate, config]);

  useEffect(() => {
    updateSchedule();
  }, [updateSchedule]);

  const addDoseTime = () => {
    setConfig(prev => ({
      ...prev,
      doseTimes: [
        ...prev.doseTimes,
        { time: "12:00", initialDose: 10, reductionRate: 10, includeZeroDoses: false }
      ]
    }));
  };

  const removeDoseTime = (index: number) => {
    setConfig(prev => ({
      ...prev,
      doseTimes: prev.doseTimes.filter((_, i) => i !== index)
    }));
  };

  const updateDoseTime = (index: number, field: keyof DoseTime, value: string | number | boolean) => {
    setConfig(prev => ({
      ...prev,
      doseTimes: prev.doseTimes.map((dose, i) => 
        i === index ? { ...dose, [field]: value } : dose
      )
    }));
  };

  const handleCalendarDownload = () => {
    try {
      const icsContent = generateMedicationICS(schedule);
      downloadICSFile(icsContent, `${config.name.toLowerCase()}-schedule.ics`);
    } catch (error) {
      console.error('Calendar creation error:', error);
      alert('Error creating calendar file. Please try again.');
    }
  };

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          Medication Taper Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        {showConfig ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Medication Name:</label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={config.name}
                  onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Start Date:</label>
                <input
                  type="date"
                  className="w-full border rounded p-2"
                  value={startDate.toISOString().split('T')[0]}
                  onChange={(e) => setStartDate(new Date(e.target.value))}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Unit:</label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={config.unit}
                  onChange={(e) => setConfig(prev => ({ ...prev, unit: e.target.value }))}
                  placeholder="mg, ml, etc"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Form:</label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={config.form}
                  onChange={(e) => setConfig(prev => ({ ...prev, form: e.target.value }))}
                  placeholder="pill, pump, etc"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Strength per Unit:</label>
                <input
                  type="number"
                  className="w-full border rounded p-2"
                  value={config.strengthPerUnit}
                  onChange={(e) => setConfig(prev => ({ ...prev, strengthPerUnit: parseFloat(e.target.value) || 0 }))}
                  step="0.1"
                  placeholder="5"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Daily Doses:</h3>
                <Button
                  onClick={addDoseTime}
                  variant="outline"
                  size="sm"
                >
                  Add Dose Time
                </Button>
              </div>
              
              {config.doseTimes.map((dose, index) => (
                <div key={index} className="grid grid-cols-5 gap-4 items-end">
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
                    <label className="block text-sm font-medium mb-2">Reduction Rate (%):</label>
                    <input
                      type="number"
                      className="w-full border rounded p-2"
                      value={dose.reductionRate}
                      onChange={(e) => updateDoseTime(index, 'reductionRate', parseFloat(e.target.value) || 0)}
                      step="0.1"
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
            </div>

            <div className="flex justify-between">
              <Button
                onClick={() => setShowConfig(false)}
                className="mt-4"
              >
                View Schedule
              </Button>
              <Button
                onClick={handleCalendarDownload}
                variant="outline"
                className="mt-4"
              >
                <Clock className="h-4 w-4" />
                Download Calendar
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Button
              onClick={() => setShowConfig(true)}
              variant="outline"
              className="mb-4"
            >
              Edit Configuration
            </Button>

            <div className="space-y-4">
              <h3 className="font-medium">Schedule:</h3>
              <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
                {schedule.map((event, index) => (
                  <div key={index} className="flex items-center gap-4 text-sm">
                    <span className="font-medium w-32">
                      {event.date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                    <span className="w-20">{event.time}</span>
                    <span>
                      {event.dosage}{event.unit} ({event.units} × {config.strengthPerUnit}{event.unit} {event.form})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MedicationSchedule;