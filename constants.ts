
import { ServiceType, ServiceDefinition } from './types';

export const SERVICES: ServiceDefinition[] = [
  { type: ServiceType.MASON, options: ['Repair', 'New'] },
  { type: ServiceType.CARPENTER, options: ['Repair', 'New'] },
  { type: ServiceType.MARBLE, options: ['New'] },
  { type: ServiceType.GRILL, options: ['New'] },
  { type: ServiceType.ELECTRICIAN, options: ['Repair', 'New'] },
  { type: ServiceType.PLUMBER, options: ['Repair', 'New'] },
  { type: ServiceType.PAINT, options: ['Repair', 'New'] },
  { type: ServiceType.MODULAR_KITCHEN, options: ['New'] },
  { type: ServiceType.FALSE_CEILING, options: ['New'] },
  { type: ServiceType.EVENT, options: ['New'] },
  { type: ServiceType.LAND, options: ['Buy', 'Sell'], requiresLandLogic: true },
  { type: ServiceType.AYA, options: ['New'] },
  { type: ServiceType.AC_REPAIR, options: ['Repair'] },
];

export const ADMIN_AUTH_KEY = 'somadhan_admin_token';
export const ENQUIRIES_STORAGE_KEY = 'somadhan_enquiries';
export const OWNER_WHATSAPP = '918420745907';
