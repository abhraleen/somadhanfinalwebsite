
export enum ServiceType {
  MASON = 'Mason',
  CARPENTER = 'Carpenter',
  MARBLE = 'Marble',
  GRILL = 'Grill',
  ELECTRICIAN = 'Electrician',
  PLUMBER = 'Plumber',
  PAINT = 'Paint',
  MODULAR_KITCHEN = 'Modular Kitchen',
  FALSE_CEILING = 'False Ceiling',
  EVENT = 'Any Event',
  LAND = 'Land',
  AYA = 'Aya',
  AC_REPAIR = 'AC Repair'
}

export enum EnquiryStatus {
  NEW = 'New',
  CONTACTED = 'Contacted',
  ASSIGNED = 'Assigned',
  COMPLETED = 'Completed'
}

export interface Enquiry {
  id: string;
  service: ServiceType;
  category: 'Repair' | 'New' | 'Buy' | 'Sell' | 'General';
  landCondition?: 'Old' | 'New';
  phone: string;
  createdAt: string;
  status: EnquiryStatus;
}

export interface ServiceDefinition {
  type: ServiceType;
  options: ('Repair' | 'New' | 'Buy' | 'Sell')[];
  requiresLandLogic?: boolean;
}
