/**
 * VARAi Design System - Emotion Type Declarations
 * 
 * This file extends the Emotion theme type with our custom theme.
 */

import '@emotion/react';
import { Theme as VaraiTheme } from './theme';

declare module '@emotion/react' {
  export interface Theme extends VaraiTheme {}
}