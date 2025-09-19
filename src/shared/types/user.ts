import { Document, Schema, model } from 'mongoose';

// User
export interface IUser extends Document {
    phoneNumber: string;
    email?: string;
    firstName: string;
    lastName: string;
    profilePictureUrl?: string;
    isVerified: boolean;
    status: 'active' | 'suspended' | 'deleted';
    role: 'passenger' | 'driver' | 'admin';
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
