import { addYears, differenceInDays, isAfter, isWithinInterval } from 'date-fns';
import { HISTORICAL_RULES, TAX_RULES } from './constants';
import { CalculationResult, PrescriptionRule, TaxType } from './types';

// Helper to replace date-fns startOfDay
const startOfDay = (date: Date): Date => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

// Helper to replace date-fns max
const max = (dates: Date[]): Date => {
    const timestamps = dates.map(d => d.getTime());
    return new Date(Math.max(...timestamps));
};

export const getPrescriptionRule = (taxType: TaxType, noticeDate: Date): PrescriptionRule => {
    // Check historical rules first
    if (HISTORICAL_RULES[taxType]) {
        for (const rule of HISTORICAL_RULES[taxType]) {
            if (rule.endDate && isWithinInterval(noticeDate, { start: rule.effectiveDate, end: rule.endDate })) {
                return rule;
            }
        }
    }

    // Return current rule or default
    return TAX_RULES[taxType] || TAX_RULES[TaxType.OTHER];
};

export const calculatePrescription = (
    taxType: TaxType,
    noticeDate: Date,
    dueDate: Date,
    hasFraud: boolean,
    hasOmission: boolean
): CalculationResult => {
    // Determine the effective start date (Latest of Notice or Due date)
    // Using startOfDay to normalize time components
    const nDate = startOfDay(noticeDate);
    const dDate = startOfDay(dueDate);
    const startDate = max([nDate, dDate]);

    const rule = getPrescriptionRule(taxType, nDate);
    
    let prescriptionYears = rule.prescriptionYears;
    let isException = false;

    // Apply exceptions
    if (hasFraud && rule.exceptionRules?.fraud) {
        prescriptionYears = rule.exceptionRules.fraud;
        isException = true;
    } else if (hasOmission && rule.exceptionRules?.omission) {
        prescriptionYears = rule.exceptionRules.omission;
        isException = true;
    }

    const endDate = addYears(startDate, prescriptionYears);
    const today = startOfDay(new Date());

    const isExpired = isAfter(today, endDate);
    
    // Calculate days remaining or expired
    const daysDiff = differenceInDays(endDate, today);
    const daysRemaining = daysDiff > 0 ? daysDiff : 0;
    const daysExpired = daysDiff < 0 ? Math.abs(daysDiff) : 0;

    return {
        taxType,
        prescriptionYears,
        legalBasis: rule.legalBasis,
        startDate,
        endDate,
        status: isExpired ? 'EXPIRED' : 'ACTIVE',
        daysRemaining,
        daysExpired,
        specialNotes: rule.specialConditions,
        isException
    };
};

export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
                const base64String = reader.result.split(',')[1];
                resolve(base64String);
            } else {
                reject(new Error('Failed to convert file to base64'));
            }
        };
        reader.onerror = (error) => reject(error);
    });
};