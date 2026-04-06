// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LimitedAccessPanel } from './LimitedAccessPanel';

describe('LimitedAccessPanel', () => {
  it('renders the headline', () => {
    render(<LimitedAccessPanel />);
    const headline = screen.getByText('Limited Access Mode');
    expect(headline).toBeTruthy();
  });

  it('lists items available without admin role', () => {
    render(<LimitedAccessPanel />);
    const workspaceItem = screen.getAllByText(/workspace inventory/i)[0];
    const healthItem = screen.getAllByText(/health scores/i)[0];
    expect(workspaceItem).toBeTruthy();
    expect(healthItem).toBeTruthy();
  });

  it('lists items requiring Fabric Admin role', () => {
    render(<LimitedAccessPanel />);
    const securityItem = screen.getAllByText(/security scan/i)[0];
    const tenantItem = screen.getAllByText(/tenant settings/i)[0];
    expect(securityItem).toBeTruthy();
    expect(tenantItem).toBeTruthy();
  });

  it('renders the Microsoft docs CTA link', () => {
    render(<LimitedAccessPanel />);
    const link = screen.getAllByRole('link', { name: /request fabric administrator role/i })[0];
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toContain('microsoft.com');
    expect(link.getAttribute('target')).toBe('_blank');
  });
});
