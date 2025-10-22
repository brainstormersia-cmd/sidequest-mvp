import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Role = 'giver' | 'doer';

type RoleContextValue = {
  role: Role;
  setRole: (role: Role) => void;
};

const RoleContext = createContext<RoleContextValue | undefined>(undefined);
const ROLE_STORAGE_KEY = 'sidequest.role';

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<Role>('giver');

  useEffect(() => {
    let mounted = true;
    const loadRole = async () => {
      try {
        const stored = await AsyncStorage.getItem(ROLE_STORAGE_KEY);
        if (stored === 'giver' || stored === 'doer') {
          if (mounted) {
            setRole(stored);
          }
        }
      } catch (error) {
        console.warn('Impossibile caricare il ruolo salvato', error);
      }
    };

    void loadRole();

    return () => {
      mounted = false;
    };
  }, []);

  const persistRole = useCallback((nextRole: Role) => {
    setRole(nextRole);
    AsyncStorage.setItem(ROLE_STORAGE_KEY, nextRole).catch((error) => {
      console.warn('Impossibile salvare il ruolo selezionato', error);
    });
  }, []);

  const value = useMemo(
    () => ({
      role,
      setRole: persistRole,
    }),
    [persistRole, role],
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole deve essere usato all\'interno di RoleProvider');
  }
  return context;
};
