'use client';

import React from 'react';
import { type ScheduleEvent, type MedicationConfig } from '@/lib/taper-calculations';
import { Clock } from 'lucide-react';

interface ScheduleDisplayProps {
  schedule: ScheduleEvent[];
  config: MedicationConfig;
  className?: string;
}

const ScheduleDisplay: React.FC<ScheduleDisplayProps> = ({
  schedule,
  config,
  className = "",
}) => {
  const simplifyFraction = (numerator: number, denominator: number) => {
    const gcd = (a: number, b: number): number => {
      return b === 0 ? a : gcd(b, a % b);
    };
    const divisor = gcd(numerator, denominator);
    return `${numerator/divisor}/${denominator/divisor}`;
  };

  const formatDose = (event: ScheduleEvent) => {
    const parts: string[] = [];
    if (event.units > 0) {
      parts.push(`${event.units} whole`);
    }
    if (event.splitUnits > 0) {
      const numerator = event.splitUnits * config.splitDivisions;
      const fraction = simplifyFraction(numerator, config.splitDivisions);
      parts.push(`${fraction}`);
    }
    return `${parts.join(' + ')} ${event.form}${parts.length > 1 || event.units !== 1 ? 's' : ''}`;
  };

  // Group schedule by date
  const scheduleByDate = schedule.reduce((acc, event) => {
    const dateKey = event.date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, ScheduleEvent[]>);

  return (
    <div className={`rounded-lg border divide-y ${className}`}>
      {Object.entries(scheduleByDate).map(([date, events]) => (
        <div key={date} className="p-4">
          <div className="font-medium text-sm text-muted-foreground mb-3">
            {date}
          </div>
          <div className="space-y-3">
            {events.map((event, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex items-center gap-2 w-20">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono text-sm">{event.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {event.dosage}{event.unit}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({formatDose(event)})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ScheduleDisplay;