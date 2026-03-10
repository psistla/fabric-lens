import { msalInstance } from '@/auth/AuthProvider';
import { FabricClient } from './fabricClient';

export const fabricClient = new FabricClient(msalInstance);
