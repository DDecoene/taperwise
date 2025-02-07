import React from 'react';
import { type ScheduleEvent, type MedicationConfig } from '@/lib/taper-calculations';
import { Card } from '@/components/ui/card';

interface PrintViewProps {
  schedule: ScheduleEvent[];
  config: MedicationConfig;
}

const PrintView: React.FC<PrintViewProps> = ({ schedule, config }) => {
  // Group schedule by date
  const scheduleByDate = schedule.reduce((acc, event) => {
    const dateKey = event.date.toLocaleDateString('en-GB', { 
      weekday: 'long', 
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, ScheduleEvent[]>);

  // Calculate total duration
  const startDate = new Date(Math.min(...schedule.map(e => e.date.getTime())));
  const endDate = new Date(Math.max(...schedule.map(e => e.date.getTime())));
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // Format dose for display
  const formatDose = (event: ScheduleEvent) => {
    const parts: string[] = [];
    if (event.units > 0) {
      parts.push(`${event.units} whole`);
    }
    if (event.splitUnits > 0) {
      parts.push(`${event.splitUnits * config.splitDivisions}/${config.splitDivisions}`);
    }
    return `${parts.join(' + ')} ${event.form}${parts.length > 1 || event.units !== 1 ? 's' : ''}`;
  };

  return (
    <div className="p-8 max-w-4xl mx-auto font-sans print-container print-content">
      {/* Header with Logo and Title */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-3">Medication Taper Schedule</h1>
        <p className="text-lg text-gray-600">
          {config.name} - {startDate.toLocaleDateString()} to {endDate.toLocaleDateString()}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Summary Card */}
        <Card className="p-6 bg-gray-50 border-none">
          <h2 className="text-xl font-bold mb-4">Schedule Summary</h2>
          <div className="grid grid-cols-2 gap-y-3">
            <div className="space-y-2">
              <p className="font-medium">Medication Details:</p>
              <ul className="list-disc list-inside text-gray-600 ml-4 space-y-1">
                <li>Name: {config.name}</li>
                <li>Form: {config.form}</li>
                <li>Strength: {config.strengthPerUnit}{config.unit} per unit</li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="font-medium">Schedule Details:</p>
              <ul className="list-disc list-inside text-gray-600 ml-4 space-y-1">
                <li>Duration: {totalDays} days</li>
                <li>Daily doses: {config.doseTimes.length}</li>
                <li>Can split units: {config.canSplit ? 'Yes' : 'No'}</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Daily Schedule */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold mb-6">Daily Schedule</h2>
          <div className="divide-y">
            {Object.entries(scheduleByDate).map(([date, events]) => (
              <div key={date} className="py-4 first:pt-0">
                <h3 className="font-medium text-lg mb-3 text-gray-900">{date}</h3>
                <div className="space-y-2 ml-4">
                  {events.map((event, index) => (
                    <div key={index} 
                         className="grid grid-cols-[120px_1fr] gap-4 text-gray-600">
                      <div className="font-mono">{event.time}</div>
                      <div>
                        <span className="font-medium text-gray-900">
                          {event.dosage}{event.unit}
                        </span>
                        <span className="ml-2 text-gray-500">
                          ({formatDose(event)})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-6 border-t text-gray-500 text-sm">
        <p className="mb-2">Generated on {new Date().toLocaleDateString()}</p>
        <p className="font-medium text-red-600">
          Important: Always follow your healthcare provider&apos;s guidance when adjusting medication.
        </p>
      </div>
    </div>
  );
};

export default PrintView;