import { Document, Schema, model } from 'mongoose';

// Passenger
export interface IPassenger extends Document {
    userId: Schema.Types.ObjectId;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    preferredLanguage: 'ar' | 'fr' | 'en';
    rating: number;
    totalRides: number;
    createdAt: Date;
    updatedAt: Date;
}