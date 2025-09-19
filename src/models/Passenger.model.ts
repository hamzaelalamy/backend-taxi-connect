import { Schema, model } from 'mongoose';
import { IPassenger } from '../shared/types/passanger';

// Passenger Schema
const passengerSchema = new Schema<IPassenger>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    emergencyContactName: { type: String, trim: true },
    emergencyContactPhone: { type: String, trim: true },
    preferredLanguage: { type: String, enum: ['ar', 'fr', 'en'], default: 'ar' },
    rating: { type: Number, default: 5.00, min: 0, max: 5 },
    totalRides: { type: Number, default: 0 }
}, {
    timestamps: true
});
passengerSchema.index({ userId: 1 });
export const Passenger = model<IPassenger>('Passenger', passengerSchema);