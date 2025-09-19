import { Document, Schema, model } from 'mongoose';

// Driver
export interface IDriver extends Document {
    userId: Schema.Types.ObjectId;
    licenseNumber: string;
    licenseExpiryDate: Date;
    cin: string;
    vehicleMake: string;
    vehicleModel: string;
    vehicleYear: number;
    vehiclePlateNumber: string;
    city: string;
    verificationStatus: 'pending' | 'approved' | 'rejected' | 'suspended';
    isOnline: boolean;
    currentLocation: {
        type: 'Point';
        coordinates: [number, number]; // [longitude, latitude]
    };
    rating: number;
    totalRides: number;
    totalEarnings: number;
    documents?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}