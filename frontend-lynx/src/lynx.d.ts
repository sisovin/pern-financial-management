import * as React from 'react';

declare global {
  // Add development flag
  const __DEV__: boolean;

  // Add profiling flag
  const __PROFILE__: boolean;
  
  // Add SSR flag
  const __ENABLE_SSR__: boolean;
  
  // Add the LEPUS global definition
  interface Window {
    __LEPUS__: {
      ready: boolean;
      env: {
        platform: string;
        isWeb: boolean;
        isApp: boolean;
        [key: string]: any;
      };
      callNative: (...args: any[]) => string;
      [key: string]: any;
    };
    
    // Add the FIRST_SCREEN_SYNC_TIMING global
    __FIRST_SCREEN_SYNC_TIMING__: {
      start: number;
      end: number | null;
      duration: number | null;
      [key: string]: any;
    };
    
    // Add the SSR flag
    __ENABLE_SSR__: boolean;
    
    // Add the DEV flag to window as well
    __DEV__: boolean;

    // Add the PROFILE flag
    __PROFILE__: boolean;
  }
  
  namespace JSX {
    interface IntrinsicElements {
      'page': any;
      'view': any;
      'text': any;
      'image': any;
    }
  }
}

export {};