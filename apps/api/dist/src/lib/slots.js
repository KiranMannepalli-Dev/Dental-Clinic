"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTimeSlots = exports.isPastTime = exports.getDayOfWeek = exports.isToday = void 0;
exports.getAvailableSlots = getAvailableSlots;
const database_1 = require("../config/database");
const isToday = (date) => {
    const today = new Date();
    const d = new Date(date);
    return d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear();
};
exports.isToday = isToday;
const getDayOfWeek = (date) => {
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return days[new Date(date).getDay()];
};
exports.getDayOfWeek = getDayOfWeek;
const isPastTime = (time) => {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const slotTime = new Date();
    slotTime.setHours(hours, minutes, 0, 0);
    return slotTime < now;
};
exports.isPastTime = isPastTime;
const generateTimeSlots = (start, end, durationMinutes) => {
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
exports.generateTimeSlots = generateTimeSlots;
async function getAvailableSlots(doctorId, date) {
    const dayOfWeek = (0, exports.getDayOfWeek)(date);
    const availability = await database_1.prisma.doctorAvailability.findUnique({
        where: { doctorId_dayOfWeek: { doctorId, dayOfWeek } }
    });
    if (!availability?.isAvailable)
        return [];
    const holiday = await database_1.prisma.clinicHoliday.findUnique({
        where: { date: new Date(date) }
    });
    if (holiday)
        return [];
    const allSlots = (0, exports.generateTimeSlots)(availability.startTime, availability.endTime, availability.slotMinutes);
    const booked = await database_1.prisma.appointment.findMany({
        where: {
            doctorId,
            appointmentDate: new Date(date),
            status: { in: ['PENDING', 'CONFIRMED'] }
        },
        select: { startTime: true }
    });
    const bookedTimes = new Set(booked.map(a => a.startTime));
    const available = allSlots.filter(slot => {
        if (bookedTimes.has(slot))
            return false;
        if ((0, exports.isToday)(date) && (0, exports.isPastTime)(slot))
            return false;
        return true;
    });
    return available;
}
