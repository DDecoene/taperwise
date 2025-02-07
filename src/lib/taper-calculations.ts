// Types
export interface DoseTime {
    time: string;
    initialDose: number;
    reductionRate: number; // percentage per week
    includeZeroDoses: boolean;
  }
  
  export interface MedicationConfig {
    name: string;
    unit: string;
    form: string;
    strengthPerUnit: number;
    doseTimes: DoseTime[];
  }
  
  export interface ScheduleEvent {
    date: Date;
    time: string;
    dosage: number;
    units: number;
    period: string;
    unit: string;
    form: string;
    medicationName: string;
  }
  
  // Core calculation functions
  export const calculateDose = (initialDose: number, reductionRate: number, week: number, strengthPerUnit: number): number => {
    // Start reductions immediately from week 0
    const reduction = (initialDose * reductionRate * week) / 100;
    const uncorrectedDose = initialDose - reduction;
    
    if (uncorrectedDose <= 0) return 0;
    
    // Calculate how many whole units we need
    const units = Math.round(uncorrectedDose / strengthPerUnit);
    // Convert back to actual possible dose
    const correctedDose = units * strengthPerUnit;
    
    return correctedDose;
  };
  
  export const calculateUnits = (dose: number, strengthPerUnit: number): number => {
    return Math.round(dose / strengthPerUnit);
  };
  
  // Helper function to get date key for sorting
  const getDateKey = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };
  
  // Schedule generation
  export const generateSchedule = (startDate: Date, config: MedicationConfig): ScheduleEvent[] => {
    const scheduleMap: { [key: string]: ScheduleEvent[] } = {};
    let week = 0;
    let hasActiveDoses = true;
    
    // Maximum 52 weeks (1 year) as a safety limit
    while (hasActiveDoses && week < 52) {
      const weekStart = new Date(startDate);
      weekStart.setDate(weekStart.getDate() + week * 7);
      
      let weekHasActiveDoses = false;
      
      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(weekStart);
        currentDate.setDate(currentDate.getDate() + day);
        const dateKey = getDateKey(currentDate);
        
        if (!scheduleMap[dateKey]) {
          scheduleMap[dateKey] = [];
        }
        
        config.doseTimes.forEach(({ time, initialDose, reductionRate, includeZeroDoses }) => {
          const dose = calculateDose(initialDose, reductionRate, week, config.strengthPerUnit);
          
          // Track if we have any active doses this week
          if (dose > 0) {
            weekHasActiveDoses = true;
          }
  
          // Add event if there's a dose or if we should include zero doses and we still have active doses
          if (dose > 0 || (includeZeroDoses && weekHasActiveDoses)) {
            const units = calculateUnits(dose, config.strengthPerUnit);
            scheduleMap[dateKey].push({
              date: new Date(currentDate),
              time,
              dosage: dose,
              units,
              period: time < "12:00" ? "morning" : "evening",
              unit: config.unit,
              form: config.form,
              medicationName: config.name
            });
          }
        });
      }
      
      // Only continue if there are active doses
      hasActiveDoses = weekHasActiveDoses;
      week++;
    }
    
    // Sort entries within each day and flatten the schedule
    const sortedSchedule: ScheduleEvent[] = Object.values(scheduleMap)
      .map(dayEvents => 
        dayEvents.sort((a, b) => a.time.localeCompare(b.time))
      )
      .flat();
    
    return sortedSchedule;
  };