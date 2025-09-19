import { Schema, model } from 'mongoose';
import { IRideTracking } from '../shared/types/rideTracking';

// Ride Tracking Schema
const rideTrackingSchema = new Schema<IRideTracking>({
    rideId: { type: Schema.Types.ObjectId, ref: 'Ride', required: true },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true }
    },
    speed: { type: Number },
    heading: { type: Number },
    accuracy: { type: Number },
    trackedAt: { type: Date, default: Date.now }
});
rideTrackingSchema.index({ rideId: 1 });
export const RideTracking = model<IRideTracking>('RideTracking', rideTrackingSchema);