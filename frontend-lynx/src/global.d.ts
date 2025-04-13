import React from 'react';

// Override SVG namespace to prevent conflicts with our custom elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Override SVG elements that conflict with Lynx elements
      view: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
        className?: string;
        style?: React.CSSProperties;
        bindtap?: () => void;
        url?: string;
        [key: string]: any;
      };
      
      image: {
        src?: string;
        className?: string;
        style?: React.CSSProperties;
        [key: string]: any;
      };
      
      // Custom Lynx elements
      page: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
        className?: string;
        style?: React.CSSProperties;
        [key: string]: any;
      };
      
      text: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
        className?: string;
        style?: React.CSSProperties;
        [key: string]: any;
      };
    }
  }
}

// This export is needed for the global augmentation to work
export {};

// Add module declaration for Lynx packages
declare module "@lynx-js/web-core" {
  export * from "@lynx-js/web-core";
}

declare module "@lynx-js/web-elements" {
  export * from "@lynx-js/web-elements";
}

// Add module declaration for Lynx React
declare module "@lynx-js/react" {
  export * from "react";
  
  // Add any Lynx-specific extensions to React hooks if needed
  export function useCallback<T extends (...args: any[]) => any>(
    callback: T,
    deps: ReadonlyArray<any>
  ): T;
  
  export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
  
  export function useEffect(
    effect: () => void | (() => void | undefined),
    deps?: ReadonlyArray<any>
  ): void;
}