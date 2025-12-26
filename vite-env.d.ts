// /// <reference types="vite/client" />

// Manually declare modules usually handled by vite/client to avoid errors
declare module '*.css';
declare module '*.svg';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';

interface ImportMetaEnv {
  readonly REACT_APP_SUPABASE_URL: string
  readonly REACT_APP_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}