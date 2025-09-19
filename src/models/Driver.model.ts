import { Schema, model } from 'mongoose';
import { IDriver } from '../shared/types/driver';

// Driver Schema
const driverSchema = new Schema<IDriver>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    licenseNumber: { type: String, required: true, unique: true, trim: true },
    licenseExpiryDate: { type: Date, required: true },
    cin: { type: String, required: true, trim: true },
    vehicleRegistration: { type: String, required: true, trim: true },
    vehicleMake: { type: String, required: true, trim: true },
    vehicleModel: { type: String, required: true, trim: true },
    vehicleYear: { type: Number, required: true },
    vehicleColor: { type: String, required: true, trim: true },
    vehiclePlateNumber: { type: String, required: true, unique: true, trim: true },
    city: { type: String, required: true, trim: true },
    verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected', 'suspended'], default: 'pending' },
    isOnline: { type: Boolean, default: false },
    currentLocation: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true }
    },
    rating: { type: Number, default: 0.00, min: 0, max: 5 },
    totalRides: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0.00 },
    documents: { type: Schema.Types.Mixed }
}, {
    timestamps: true
});
driverSchema.index({ userId: 1 });
driverSchema.index({ verificationStatus: 1 });
driverSchema.index({ 'currentLocation.coordinates': '2dsphere' });
export const Driver = model<IDriver>('Driver', driverSchema);