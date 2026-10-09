export type Building = 'A' | 'B' | 'C' | 'V';
export type Campus = 'K' | 'V';

export type Equipment =
    | 'projector'
    | 'whiteboard'
    | 'computer'
    | 'air_conditioner';

export interface Room {
    id: string;
    name: string;
    building: Building;
    campus: Campus;
    floor: number;
    capacity: number;
    equipments: Equipment[];
    image: string;
}

export interface UserSession {
    id: string;
    name: string;
    studentId: string;
}

export type BookingStatus =
    | 'confirmed'
    | 'checked-in'
    | 'cancelled';

export interface Booking {
    id: string;
    passCode: string;

    roomId: string;
    userId: string;

    date: string;
    slotId: string;

    status: BookingStatus;

    createdAt: string;

    notificationId?: string;
}

export interface TimeSlot {
    id: string;
    start: string;
    end: string;
    label: string;
}
