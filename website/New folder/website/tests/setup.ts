/**
 * Test Setup Configuration for KOPMA UNNES Website
 */

import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

afterEach(() => {
  cleanup();
});

process.env.NODE_ENV = 'test';
