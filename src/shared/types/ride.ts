import { Document, Schema, model } from 'mongoose';

// Ride
export interface IRide extends Document {
    passengerId: Schema.Types.ObjectId;
    driverId?: Schema.Types.ObjectId;
    pickupLocation: {
        type: 'Point';
        coordinates: [number, number];
    };
    pickupAddress: string;
    destinationLocation?: {
        type: 'Point';
        coordinates: [number, number];
    };
    destinationAddress?: string;
    estimatedDistance?: number;
    actualDistance?: number;
    estimatedDuration?: number;
    actualDuration?: number;
    estimatedFare?: number;
    actualFare?: number;
    status: 'requested' | 'accepted' | 'driver_arrived' | 'in_progress' | 'completed' | 'cancelled';
    paymentMethod: 'cash' | 'card' | 'wallet';
    paymentStatus: 'pending' | 'completed' | 'failed';
    specialInstructions?: string;
    cancellationReason?: string;
    cancelledBy?: 'passenger' | 'driver' | 'system';
    requestedAt: Date;
    acceptedAt?: Date;
    startedAt?: Date;
    completedAt?: Date;
    cancelledAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}