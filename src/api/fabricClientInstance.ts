import { msalInstance } from '@/auth/AuthProvider';
import { FabricClient } from './fabricClient';

// msalInstance is non-null when not in demo mode; fabricClient guards demo calls internally.
export const fabricClient = new FabricClient(msalInstance!);
