import { prisma } from '../config/database';

export interface TimeSlotInfo {
  time: string;
  available: boolean;
  status: 'AVAILABLE' | 'FULLY_BOOKED' | 'BLOCKED' | 'PAST';
  bookingCount: number;
}

export const getLocalDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const isToday = (date: string) => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;
  return date === todayStr;
};

export const getDayOfWeek = (date: string) => {
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as const;
  const d = getLocalDate(date);
  return days[d.getDay()];
};

export const isPastTime = (time: string) => {
  const now = new Date();
  const [hours, minutes] = time.split(':').map(Number);
  const slotTime = new Date();
  slotTime.setHours(hours, minutes, 0, 0);
  return slotTime < now;
};

export const generateTimeSlots = (start: string, end: string, durationMinutes: number) => {
  const slots = [];
  let [currentH, currentM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);

  while (currentH < endH || (currentH === endH && currentM < endM)) {
    const timeStr = `${currentH.toString().padStart(2, '0')}:${currentM.toString().padStart(2, '0')}`;
    slots.push(timeStr);
    
    currentM += durationMinutes;
    if (currentM >= 60) {
      currentH += Math.floor(currentM / 60);
      currentM %= 60;
    }
  }

  return slots;
};

export async function getAvailableSlots(doctorId: string, date: string): Promise<TimeSlotInfo[]> {
  const dayOfWeek = getDayOfWeek(date);

  const availability = await prisma.doctorAvailability.findUnique({
    where: { doctorId_dayOfWeek: { doctorId, dayOfWeek } }
  });

  if (!availability?.isAvailable) return [];

  // Query holiday matching the date at midnight UTC
  const holiday = await prisma.clinicHoliday.findUnique({
    where: { date: new Date(date) }
  });
  if (holiday) return [];

  const allSlots = generateTimeSlots(
    availability.startTime,
    availability.endTime,
    availability.slotMinutes
  );

  const booked = await prisma.appointment.findMany({
    where: {
      doctorId,
      appointmentDate: new Date(date),
      status: { in: ['PENDING', 'CONFIRMED'] }
    },
    select: { 
      startTime: true,
      patient: {
        select: { email: true }
      }
    }
  });

  // Count bookings and track admin blocked slots
  const bookingCounts: Record<string, number> = {};
  const adminBlockedSlots = new Set<string>();

  for (const appt of booked) {
    const time = appt.startTime;
    if (appt.patient?.email === 'blocked-slot@heshvithadental.com') {
      adminBlockedSlots.add(time);
    } else {
      bookingCounts[time] = (bookingCounts[time] || 0) + 1;
    }
  }

  const available: TimeSlotInfo[] = allSlots.map(slot => {
    let status: 'AVAILABLE' | 'FULLY_BOOKED' | 'BLOCKED' | 'PAST' = 'AVAILABLE';
    const bookingCount = bookingCounts[slot] || 0;

    if (adminBlockedSlots.has(slot)) {
      status = 'BLOCKED';
    } else if (bookingCount >= 3) {
      status = 'FULLY_BOOKED';
    } else if (isToday(date) && isPastTime(slot)) {
      status = 'PAST';
    }

    return {
      time: slot,
      available: status === 'AVAILABLE',
      status,
      bookingCount
    };
  });

  return available;
}

