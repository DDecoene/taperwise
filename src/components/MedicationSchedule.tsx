'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { generateMedicationICS, downloadICSFile } from '@/lib/calendar-utils';
import { 
  type MedicationConfig, 
  type ScheduleEvent,
  generateSchedule
} from '@/lib/taper-calculations';
import MedicationFormConfig from './MedicationFormConfig';
import DoseTimesConfig from './DoseTimesConfig';
import ScheduleDisplay from './ScheduleDisplay';

const DEFAULT_CONFIG: MedicationConfig = {
  name: "Medication",
  unit: "mg",
  form: "pill",
  strengthPerUnit: 2,
  canSplit: true,
  splitDivisions: 4,
  doseTimes: [
    { time: "08:00", initialDose: 10, includeZeroDoses: false, daysPerStep: 7 },
    { time: "20:00", initialDose: 10, includeZeroDoses: false, daysPerStep: 7 }
  ]
};

const MedicationSchedule = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [config, setConfig] = useState<MedicationConfig>(DEFAULT_CONFIG);
  const [schedule, setSchedule] = useState<ScheduleEvent[]>([]);

  const updateSchedule = useCallback(() => {
    const newSchedule = generateSchedule(startDate, config);
    setSchedule(newSchedule);
  }, [startDate, config]);

  useEffect(() => {
    updateSchedule();
  }, [updateSchedule]);

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
      <CardContent className="space-y-6">
        {/* Basic info */}
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

        {/* Form configuration */}
        <MedicationFormConfig 
          config={config}
          onConfigChange={setConfig}
        />

        {/* Dose times configuration */}
        <DoseTimesConfig 
          config={config}
          onConfigChange={setConfig}
        />

        {/* Schedule Display */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Detailed Schedule</h3>
            <Button
              onClick={handleCalendarDownload}
              variant="default"
              size="default"
              className="gap-2"
            >
              <Clock className="h-4 w-4" />
              Download Calendar
            </Button>
          </div>
          <ScheduleDisplay 
            schedule={schedule}
            config={config}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicationSchedule;