// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { usePageMeta } from './usePageMeta';

function Probe() {
  usePageMeta({ path: '/about', title: 'About', description: 'About page.' });
  return null;
}

const canonical = () => document.head.querySelector('link[rel="canonical"]')?.getAttribute('href');
const ogUrl = () => document.head.querySelector('meta[property="og:url"]')?.getAttribute('content');

describe('usePageMeta', () => {
  beforeEach(() => {
    document.head.innerHTML = `
      <link rel="canonical" href="https://www.fabric-lens.com" />
      <meta name="description" content="Root description." />
      <meta property="og:url" content="https://www.fabric-lens.com" />
      <meta property="og:title" content="Root title" />
      <meta property="og:description" content="Root description." />
      <meta name="twitter:title" content="Root title" />
      <meta name="twitter:description" content="Root description." />
    `;
    // After head.innerHTML, since replacing it drops the <title> element.
    document.title = 'fabric-lens';
  });

  it('points canonical and og:url at the route', () => {
    render(<Probe />);
    expect(canonical()).toBe('https://www.fabric-lens.com/about');
    expect(ogUrl()).toBe('https://www.fabric-lens.com/about');
  });

  it('sets document.title to the given title verbatim', () => {
    render(<Probe />);
    expect(document.title).toBe('About');
  });

  it('restores the root values on unmount', () => {
    const { unmount } = render(<Probe />);
    unmount();
    expect(canonical()).toBe('https://www.fabric-lens.com');
    expect(ogUrl()).toBe('https://www.fabric-lens.com');
    expect(document.title).toBe('fabric-lens');
  });
});
