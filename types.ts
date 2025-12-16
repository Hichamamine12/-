export enum TaxType {
    INCOME_TAX = "ضريبة الدخل",
    CORPORATE_TAX = "ضريبة الشركات",
    VAT = "الضريبة على القيمة المضافة",
    REAL_ESTATE_TAX = "الضريبة العقارية",
    PROPERTY_TAX = "الضريبة على الأملاك",
    HOUSING_TAX = "ضريبة السكن",
    PROFESSIONAL_TAX = "الضريبة المهنية",
    URBAN_TAX = "الرسم الحضري",
    RURAL_TAX = "الرسم القروي",
    CLEANING_TAX = "ضريبة النظافة",
    REGISTRATION_DUTIES = "رسوم التسجيل",
    STAMP_DUTIES = "رسوم الطابع",
    ENVIRONMENTAL_FEES = "الرسوم البيئية",
    COMMUNITY_SERVICES = "الخدمات الجماعية",
    CUSTOMS_DUTIES = "الرسوم الجمركية",
    CNSS = "اشتراكات الضمان الاجتماعي",
    OTHER = "ضريبة أخرى"
}

export enum LegalBasis {
    CGI_ARTICLE_232 = "المادة 232 من المدونة العامة للضرائب",
    CGI_ARTICLE_123 = "المادة 123 من المدونة العامة للضرائب",
    CGI_GENERAL = "المبادئ العامة للمدونة العامة للضرائب",
    LAW_47_06 = "القانون 47-06 المتعلق بالجماعات الترابية",
    FINANCE_LAW = "قانون المالية",
    CUSTOMS_CODE = "المجموعة الجمركية",
    CNSS_LAW = "القانون المنظم للصندوق الوطني للضمان الاجتماعي",
    ENVIRONMENTAL_LAW = "القانون البيئي",
    LOCAL_REGULATIONS = "الأنظمة المحلية"
}

export interface PrescriptionRule {
    id: string;
    taxType: TaxType;
    prescriptionYears: number;
    prescriptionMonths: number;
    legalBasis: LegalBasis;
    effectiveDate: Date;
    endDate?: Date;
    specialConditions?: string;
    exceptionRules?: {
        fraud?: number;
        omission?: number;
    };
}

export interface CalculationResult {
    taxType: TaxType;
    prescriptionYears: number;
    legalBasis: string;
    startDate: Date;
    endDate: Date;
    status: 'ACTIVE' | 'EXPIRED';
    daysRemaining: number;
    daysExpired: number;
    specialNotes?: string;
    isException: boolean;
}