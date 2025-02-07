// src/lib/calendar-utils.ts

interface CalendarEvent {
    date: Date;
    time: string;
    title: string;
    description: string;
    duration?: string; // PT15M format
  }
  
  export interface MedicationEvent {
    date: Date;
    time: string;
    dosage: number;
    units: number;
    period: string;
    unit: string;
    form: string;
    medicationName: string;
  }
  
  const formatICSDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  const createEventBlock = (event: CalendarEvent, uid: string): string[] => {
    const eventDate = new Date(event.date);
    const [hours, minutes] = event.time.split(':');
    eventDate.setHours(parseInt(hours), parseInt(minutes), 0);
    
    // Add event timestamp to ensure uniqueness
    const eventTimestamp = formatICSDate(eventDate);
    
    return [
      'BEGIN:VEVENT',
      `UID:${uid}-${eventTimestamp}@medication-schedule`,
      `DTSTAMP:${formatICSDate(new Date())}`,
      `DTSTART;TZID=Europe/London:${eventTimestamp}`,
      `DURATION:${event.duration || 'PT15M'}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'DESCRIPTION:Time to take medication',
      'TRIGGER:PT0M',
      'END:VALARM',
      'END:VEVENT'
    ];
  };
  
  export const generateMedicationICS = (events: MedicationEvent[], timezone = 'Europe/London'): string => {
    const calendarEvents: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Medication Schedule//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:Medication Schedule`,
      `X-WR-TIMEZONE:${timezone}`,
      'BEGIN:VTIMEZONE',
      `TZID:${timezone}`,
      'END:VTIMEZONE'
    ];
  
    events.forEach((event, index) => {
      const eventDate = new Date(event.date);
      const [hours, minutes] = event.time.split(':');
      eventDate.setHours(parseInt(hours), parseInt(minutes), 0);
      
      // Create a unique identifier using the event index, date, and time
      const uid = `med-${index}-${eventDate.getTime()}`;
      
      const calendarEvent = createEventBlock({
        date: event.date,
        time: event.time,
        title: `Take ${event.medicationName} - ${event.units}x ${event.form}`,
        description: `Take ${event.units} ${event.form}s of ${event.medicationName}\nDose: ${event.dosage}${event.unit}\nForm: ${event.units} x ${event.form}\nTime: ${event.time}`,
      }, uid);
  
      calendarEvents.push(...calendarEvent);
    });
  
    calendarEvents.push('END:VCALENDAR');
    return calendarEvents.join('\r\n');
  };
  
  export const downloadICSFile = (content: string, filename: string): void => {
    try {
      const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      throw new Error('Error creating calendar file. Please try again.');
    }
  };