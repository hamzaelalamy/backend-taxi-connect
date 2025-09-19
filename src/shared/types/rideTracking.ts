import { Document, Schema, model } from 'mongoose';

// Ride Tracking
export interface IRideTracking extends Document {
    rideId: Schema.Types.ObjectId;
    location: {
        type: 'Point';
        coordinates: [number, number];
    };
    speed?: number;
    heading?: number;
    accuracy?: number;
    trackedAt: Date;
}