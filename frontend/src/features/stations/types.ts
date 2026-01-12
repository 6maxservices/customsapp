export interface ComplianceStatus {
    status: 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING';
    badges: string[];
    violations: string[];
    lastCheck?: string;
    score?: number;
}

export interface Station {
    id: string;
    name: string;
    slug?: string;
    address?: string;
    city?: string;
    prefecture?: string;
    amdika?: string;
    installationType?: string;
    lat?: number;
    lng?: number;
    isActive: boolean;
    companyId: string;
    company?: {
        id: string;
        name: string;
        taxId: string;
    };
    compliance?: ComplianceStatus;
    _count?: {
        tasks: number;
    };
    createdAt?: string;
    updatedAt?: string;
}
