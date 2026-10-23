import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { App } from '../src/App';

describe('App Root Component', () => {
  it('renders to HTML string without throwing', () => {
    const html = renderToString(<App />);
    expect(html).toContain('CADENCE');
  });
});
