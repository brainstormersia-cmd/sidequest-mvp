import React, { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { Sheet, SheetProps } from '../shared/ui/Sheet';

type OpenSheetOptions = Omit<SheetProps, 'visible' | 'onClose' | 'children'>;

type SheetState = {
  Component: React.ComponentType<any> | null;
  props?: Record<string, unknown>;
  options?: OpenSheetOptions;
};

type ModalSheetContextValue = {
  openSheet: (
    component: React.ComponentType<any>,
    props?: Record<string, unknown>,
    options?: OpenSheetOptions,
  ) => void;
  closeSheet: () => void;
};

const ModalSheetContext = createContext<ModalSheetContextValue | undefined>(undefined);

export const useModalSheet = () => {
  const context = useContext(ModalSheetContext);
  if (!context) {
    throw new Error('useModalSheet deve essere usato dentro ModalSheetProvider');
  }
  return context;
};

export const ModalSheetProvider = ({ children }: { children: ReactNode }) => {
  const [sheet, setSheet] = useState<SheetState>({ Component: null });

  const closeSheet = useCallback(() => {
    setSheet({ Component: null });
  }, []);

  const openSheet = useCallback<ModalSheetContextValue['openSheet']>((Component, props, options) => {
    setSheet({ Component, props, options });
  }, []);

  const value = useMemo(() => ({ openSheet, closeSheet }), [openSheet, closeSheet]);

  const { Component, props, options } = sheet;

  return (
    <ModalSheetContext.Provider value={value}>
      {children}
      {Component ? (
        <Sheet
          visible
          onClose={closeSheet}
          presentation={options?.presentation}
          accessibilityLabel={options?.accessibilityLabel}
          title={options?.title}
        >
          <Component {...props} closeSheet={closeSheet} />
        </Sheet>
      ) : null}
    </ModalSheetContext.Provider>
  );
};
