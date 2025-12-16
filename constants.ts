import { LegalBasis, PrescriptionRule, TaxType } from './types';

const CURRENT_EFFECTIVE_DATE = new Date(2016, 0, 1);

export const TAX_RULES: Record<string, PrescriptionRule> = {
    [TaxType.INCOME_TAX]: {
        id: 'ir-rule',
        taxType: TaxType.INCOME_TAX,
        prescriptionYears: 4,
        prescriptionMonths: 0,
        legalBasis: LegalBasis.CGI_ARTICLE_232,
        effectiveDate: CURRENT_EFFECTIVE_DATE,
        specialConditions: "تبدأ من تاريخ استحقاق الضريبة أو إيداع التصريح، أيهما أحدث",
        exceptionRules: {
            fraud: 10,
            omission: 6
        }
    },
    [TaxType.CORPORATE_TAX]: {
        id: 'is-rule',
        taxType: TaxType.CORPORATE_TAX,
        prescriptionYears: 4,
        prescriptionMonths: 0,
        legalBasis: LegalBasis.CGI_ARTICLE_232,
        effectiveDate: CURRENT_EFFECTIVE_DATE,
        specialConditions: "تنطبق نفس قواعد ضريبة الدخل مع مراعاة خصوصية الشركات",
        exceptionRules: {
            fraud: 10,
            omission: 6
        }
    },
    [TaxType.VAT]: {
        id: 'tva-rule',
        taxType: TaxType.VAT,
        prescriptionYears: 4,
        prescriptionMonths: 0,
        legalBasis: LegalBasis.CGI_GENERAL,
        effectiveDate: CURRENT_EFFECTIVE_DATE,
        specialConditions: "تنطبق القواعد العامة مع مراعاة التصريحات الشهرية"
    },
    [TaxType.REAL_ESTATE_TAX]: {
        id: 'real-estate-rule',
        taxType: TaxType.REAL_ESTATE_TAX,
        prescriptionYears: 4,
        prescriptionMonths: 0,
        legalBasis: LegalBasis.LAW_47_06,
        effectiveDate: CURRENT_EFFECTIVE_DATE
    },
    [TaxType.HOUSING_TAX]: {
        id: 'th-rule',
        taxType: TaxType.HOUSING_TAX,
        prescriptionYears: 4,
        prescriptionMonths: 0,
        legalBasis: LegalBasis.LAW_47_06,
        effectiveDate: CURRENT_EFFECTIVE_DATE,
        specialConditions: "تفرضها الجماعات الترابية على المساكن"
    },
    [TaxType.PROFESSIONAL_TAX]: {
        id: 'tp-rule',
        taxType: TaxType.PROFESSIONAL_TAX,
        prescriptionYears: 4,
        prescriptionMonths: 0,
        legalBasis: LegalBasis.LAW_47_06,
        effectiveDate: CURRENT_EFFECTIVE_DATE,
        specialConditions: "تطبق على الأنشطة المهنية في النطاق الترابي"
    },
    [TaxType.URBAN_TAX]: {
        id: 'urban-rule',
        taxType: TaxType.URBAN_TAX,
        prescriptionYears: 4,
        prescriptionMonths: 0,
        legalBasis: LegalBasis.LAW_47_06,
        effectiveDate: CURRENT_EFFECTIVE_DATE
    },
    [TaxType.RURAL_TAX]: {
        id: 'rural-rule',
        taxType: TaxType.RURAL_TAX,
        prescriptionYears: 4,
        prescriptionMonths: 0,
        legalBasis: LegalBasis.LAW_47_06,
        effectiveDate: CURRENT_EFFECTIVE_DATE
    },
    [TaxType.CLEANING_TAX]: {
        id: 'clean-rule',
        taxType: TaxType.CLEANING_TAX,
        prescriptionYears: 4,
        prescriptionMonths: 0,
        legalBasis: LegalBasis.LAW_47_06,
        effectiveDate: CURRENT_EFFECTIVE_DATE,
        specialConditions: "تفرضها الجماعات المحلية لخدمات النظافة"
    },
    [TaxType.REGISTRATION_DUTIES]: {
        id: 'registration-rule',
        taxType: TaxType.REGISTRATION_DUTIES,
        prescriptionYears: 4,
        prescriptionMonths: 0,
        legalBasis: LegalBasis.CGI_GENERAL,
        effectiveDate: CURRENT_EFFECTIVE_DATE,
        specialConditions: "تنطبق القواعد العامة مع استثناءات للأحكام القديمة"
    },
    [TaxType.STAMP_DUTIES]: {
        id: 'stamp-rule',
        taxType: TaxType.STAMP_DUTIES,
        prescriptionYears: 4,
        prescriptionMonths: 0,
        legalBasis: LegalBasis.FINANCE_LAW,
        effectiveDate: CURRENT_EFFECTIVE_DATE
    },
    [TaxType.ENVIRONMENTAL_FEES]: {
        id: 'env-rule',
        taxType: TaxType.ENVIRONMENTAL_FEES,
        prescriptionYears: 4,
        prescriptionMonths: 0,
        legalBasis: LegalBasis.ENVIRONMENTAL_LAW,
        effectiveDate: CURRENT_EFFECTIVE_DATE
    },
    [TaxType.COMMUNITY_SERVICES]: {
        id: 'community-rule',
        taxType: TaxType.COMMUNITY_SERVICES,
        prescriptionYears: 4,
        prescriptionMonths: 0,
        legalBasis: LegalBasis.LOCAL_REGULATIONS,
        effectiveDate: CURRENT_EFFECTIVE_DATE
    },
    [TaxType.CUSTOMS_DUTIES]: {
        id: 'customs-rule',
        taxType: TaxType.CUSTOMS_DUTIES,
        prescriptionYears: 3,
        prescriptionMonths: 0,
        legalBasis: LegalBasis.CUSTOMS_CODE,
        effectiveDate: CURRENT_EFFECTIVE_DATE,
        specialConditions: "وفق المجموعة الجمركية المغربية"
    },
    [TaxType.CNSS]: {
        id: 'cnss-rule',
        taxType: TaxType.CNSS,
        prescriptionYears: 5,
        prescriptionMonths: 0,
        legalBasis: LegalBasis.CNSS_LAW,
        effectiveDate: CURRENT_EFFECTIVE_DATE,
        specialConditions: "اشتراكات الصندوق الوطني للضمان الاجتماعي"
    },
    [TaxType.OTHER]: {
        id: 'other-rule',
        taxType: TaxType.OTHER,
        prescriptionYears: 4,
        prescriptionMonths: 0,
        legalBasis: LegalBasis.CGI_GENERAL,
        effectiveDate: CURRENT_EFFECTIVE_DATE,
        specialConditions: "القاعدة العامة للمدونة العامة للضرائب"
    }
};

export const HISTORICAL_RULES: Record<string, PrescriptionRule[]> = {
    [TaxType.REGISTRATION_DUTIES]: [
        {
            id: 'old-reg-rule',
            taxType: TaxType.REGISTRATION_DUTIES,
            prescriptionYears: 10,
            prescriptionMonths: 0,
            legalBasis: LegalBasis.CGI_GENERAL,
            effectiveDate: new Date(2000, 0, 1),
            endDate: new Date(2015, 11, 31),
            specialConditions: "القواعد القديمة لرسوم التسجيل غير المصرح عنها"
        }
    ]
};