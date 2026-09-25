import { TimeSlot } from "../types";

export const TIME_SLOTS: TimeSlot[] = [
  {
    id: "slot-1",
    start: "07:30",
    end: "09:30",
    label: "07:30 - 09:30",
  },
  {
    id: "slot-2",
    start: "09:30",
    end: "11:30",
    label: "09:30 - 11:30",
  },
  {
    id: "slot-3",
    start: "13:00",
    end: "15:00",
    label: "13:00 - 15:00",
  },
  {
    id: "slot-4",
    start: "15:00",
    end: "17:00",
    label: "15:00 - 17:00",
  },
];

export const EQUIPMENT_LABELS = {
  projector: "Máy chiếu",
  whiteboard: "Bảng trắng",
  computer: "Máy tính cấu hình cao",
  air_conditioner: "Máy lạnh",
};
