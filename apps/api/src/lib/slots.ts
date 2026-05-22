import { prisma } from '../config/database';

export const isToday = (date: string) => {
  const today = new Date();
  const d = new Date(date);
  return d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
};

export const getDayOfWeek = (date: string) => {
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as const;
  return days[new Date(date).getDay()];
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

export async function getAvailableSlots(doctorId: string, date: string): Promise<string[]> {
  const dayOfWeek = getDayOfWeek(date);

  const availability = await prisma.doctorAvailability.findUnique({
    where: { doctorId_dayOfWeek: { doctorId, dayOfWeek } }
  });

  if (!availability?.isAvailable) return [];

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
    select: { startTime: true }
  });
  
  const bookedTimes = new Set(booked.map((a: { startTime: string }) => a.startTime));

  const available = allSlots.filter(slot => {
    if (bookedTimes.has(slot)) return false;
    if (isToday(date) && isPastTime(slot)) return false;
    return true;
  });

  return available;
}
