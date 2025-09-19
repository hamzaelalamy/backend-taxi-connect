import { Schema, model } from 'mongoose';
import { IRide } from '../shared/types/ride';

// Ride Schema
const rideSchema = new Schema<IRide>({
    passengerId: { type: Schema.Types.ObjectId, ref: 'Passenger', required: true },
    driverId: { type: Schema.Types.ObjectId, ref: 'Driver' },
    pickupLocation: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true }
    },
    pickupAddress: { type: String, required: true, trim: true },
    destinationLocation: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number] }
    },
    destinationAddress: { type: String, trim: true },
    estimatedDistance: { type: Number },
    actualDistance: { type: Number },
    estimatedDuration: { type: Number },
    actualDuration: { type: Number },
    estimatedFare: { type: Number },
    actualFare: { type: Number },
    status: {
        type: String,
        enum: ['requested', 'accepted', 'driver_arrived', 'in_progress', 'completed', 'cancelled'],
        default: 'requested'
    },
    paymentMethod: { type: String, enum: ['cash', 'card', 'wallet'], default: 'cash' },
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    specialInstructions: { type: String },
    cancellationReason: { type: String },
    cancelledBy: { type: String, enum: ['passenger', 'driver', 'system'] },
    requestedAt: { type: Date, default: Date.now },
    acceptedAt: { type: Date },
    startedAt: { type: Date },
    completedAt: { type: Date },
    cancelledAt: { type: Date }
}, {
    timestamps: true
});
rideSchema.index({ 'pickupLocation.coordinates': '2dsphere' });
rideSchema.index({ 'destinationLocation.coordinates': '2dsphere' });
export const Ride = model<IRide>('Ride', rideSchema);