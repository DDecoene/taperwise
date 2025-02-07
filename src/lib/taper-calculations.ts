// Types
export interface DoseStep {
    dose: number;
    daysAtDose: number;
  }
  
  export interface DoseTime {
    time: string;
    initialDose: number;
    includeZeroDoses: boolean;
    daysPerStep: number;
    customSteps?: DoseStep[]; // Optional custom stepping sequence
  }
  
  export interface MedicationConfig {
    name: string;
    unit: string;
    form: string;
    strengthPerUnit: number;
    canSplit: boolean;
    splitDivisions: number;
    doseTimes: DoseTime[];
  }
  
  export interface ScheduleEvent {
    date: Date;
    time: string;
    dosage: number;
    units: number;
    splitUnits: number;
    period: string;
    unit: string;
    form: string;
    medicationName: string;
  }
  
  export interface TaperMetrics {
    possibleSteps: number[];
    numberOfSteps: number;
    totalDays: number;
    doseTimeSchedules: {
      time: string;
      steps: number[];
      duration: number;
    }[];
  }
  
  // Calculate physically possible dose steps
  const calculatePhysicalDoseSteps = (
    initialDose: number,
    strengthPerUnit: number,
    canSplit: boolean,
    splitDivisions: number
  ): number[] => {
    const steps: Set<number> = new Set();
    
    if (!canSplit) {
      // Only whole pill steps
      let currentDose = initialDose;
      while (currentDose > 0) {
        steps.add(currentDose);
        currentDose = Math.max(0, currentDose - strengthPerUnit);
      }
    } else {
      // Calculate possible combinations of whole and split pills
      const fraction = strengthPerUnit / splitDivisions;
      let currentDose = initialDose;
      
      while (currentDose > 0) {
        // Round to nearest possible fraction to avoid floating point issues
        currentDose = Number(currentDose.toFixed(4));
        steps.add(currentDose);
        
        // Calculate next possible lower dose
        const wholeUnits = Math.floor(currentDose / strengthPerUnit);
        const remainingDose = currentDose - (wholeUnits * strengthPerUnit);
        const splitUnits = Math.floor(remainingDose / fraction);
        
        if (splitUnits > 0) {
          currentDose = (wholeUnits * strengthPerUnit) + ((splitUnits - 1) * fraction);
        } else {
          currentDose = ((wholeUnits - 1) * strengthPerUnit) + (splitDivisions - 1) * fraction;
        }
        
        if (currentDose < fraction) {
          if (currentDose > 0) steps.add(fraction);
          break;
        }
      }
    }
    
    return Array.from(steps).sort((a, b) => b - a);
  };
  
  // Calculate taper metrics for each dose time
  export const calculateTaperMetrics = (config: MedicationConfig): TaperMetrics => {
    const doseTimeSchedules = config.doseTimes.map(doseTime => {
      const steps = calculatePhysicalDoseSteps(
        doseTime.initialDose,
        config.strengthPerUnit,
        config.canSplit,
        config.splitDivisions
      );
      
      return {
        time: doseTime.time,
        steps,
        duration: steps.length * doseTime.daysPerStep
      };
    });
    
    const totalDays = Math.max(...doseTimeSchedules.map(s => s.duration));
    
    return {
      possibleSteps: doseTimeSchedules[0]?.steps || [],
      numberOfSteps: doseTimeSchedules[0]?.steps.length || 0,
      totalDays,
      doseTimeSchedules
    };
  };
  
  // Calculate units for a specific dose
  const calculateUnits = (
    dose: number,
    strengthPerUnit: number,
    splitDivisions: number
  ): { wholeUnits: number; splitUnits: number } => {
    const totalUnits = dose / strengthPerUnit;
    const wholeUnits = Math.floor(totalUnits);
    const splitUnits = Math.round((totalUnits - wholeUnits) * splitDivisions) / splitDivisions;
    
    return { wholeUnits, splitUnits };
  };
  
  // Generate the full schedule
  export const generateSchedule = (startDate: Date, config: MedicationConfig): ScheduleEvent[] => {
    const scheduleMap: { [key: string]: ScheduleEvent[] } = {};
    
    config.doseTimes.forEach(doseTime => {
      const steps = calculatePhysicalDoseSteps(
        doseTime.initialDose,
        config.strengthPerUnit,
        config.canSplit,
        config.splitDivisions
      );
      
      const currentDate = new Date(startDate);
      
      steps.forEach(dose => {
        // Stay at this dose for the specified days
        for (let day = 0; day < doseTime.daysPerStep; day++) {
          const dateKey = currentDate.toISOString().split('T')[0];
          
          if (!scheduleMap[dateKey]) {
            scheduleMap[dateKey] = [];
          }
          
          if (dose > 0 || doseTime.includeZeroDoses) {
            const { wholeUnits, splitUnits } = calculateUnits(
              dose,
              config.strengthPerUnit,
              config.splitDivisions
            );
            
            scheduleMap[dateKey].push({
              date: new Date(currentDate),
              time: doseTime.time,
              dosage: dose,
              units: wholeUnits,
              splitUnits,
              period: doseTime.time < "12:00" ? "morning" : "evening",
              unit: config.unit,
              form: config.form,
              medicationName: config.name
            });
          }
          
          // Move to next day
          currentDate.setDate(currentDate.getDate() + 1);
        }
      });
    });
    
    // Sort entries within each day and flatten the schedule
    return Object.values(scheduleMap)
      .map(dayEvents => dayEvents.sort((a, b) => a.time.localeCompare(b.time)))
      .flat();
  };