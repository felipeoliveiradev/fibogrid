import { describe, it, expect, vi } from 'vitest';
import { validateIngress, validateEgress } from './permissionValidator';
import { GridPermissions } from '../constants/permissions';
import type { GridIngress, GridEgress } from '../types';

describe('Ingress / Egress Security Validator', () => {
  describe('validateIngress', () => {
    it('allows all actions when ingress is undefined', () => {
      expect(validateIngress(undefined, 'any-grid', GridPermissions.API.SetFilterModel)).toBe(true);
      expect(validateIngress(undefined, 'undefined', GridPermissions.Manager.Reset)).toBe(true);
    });

    it('blocks all actions when ingress is an empty array (Deny All)', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      expect(validateIngress([], 'master-grid', GridPermissions.API.SetFilterModel)).toBe(false);
      expect(warnSpy).toHaveBeenCalledOnce();
      warnSpy.mockRestore();
    });

    it('allows exact permission matches and blocks unlisted actions for an origin', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const rules: GridIngress[] = [
        {
          origin: 'master-grid',
          permissions: [GridPermissions.API.SetFilterModel, GridPermissions.Manager.Add],
        },
      ];

      expect(validateIngress(rules, 'master-grid', 'api.setFilterModel')).toBe(true);
      expect(validateIngress(rules, 'master-grid', 'manager.add')).toBe(true);
      expect(validateIngress(rules, 'master-grid', 'api.selectAll')).toBe(false);
      expect(validateIngress(rules, 'unknown-grid', 'api.setFilterModel')).toBe(false);
      warnSpy.mockRestore();
    });

    it('supports wildcard permissions (*, api.*, manager.*, on*)', () => {
      const rules: GridIngress[] = [
        { origin: 'admin-grid', permissions: ['*'] },
        { origin: 'api-only', permissions: [GridPermissions.API.All] },
        { origin: 'mgr-only', permissions: [GridPermissions.Manager.All] },
        { origin: 'evt-only', permissions: [GridPermissions.Events.All] },
      ];

      expect(validateIngress(rules, 'admin-grid', 'manager.remove')).toBe(true);
      expect(validateIngress(rules, 'admin-grid', 'onSelectionChanged')).toBe(true);

      expect(validateIngress(rules, 'api-only', 'api.setPage')).toBe(true);
      expect(validateIngress(rules, 'api-only', 'manager.add')).toBe(false);

      expect(validateIngress(rules, 'mgr-only', 'manager.replaceAll')).toBe(true);
      expect(validateIngress(rules, 'mgr-only', 'api.setPage')).toBe(false);

      expect(validateIngress(rules, 'evt-only', 'onSelectionChanged')).toBe(true);
      expect(validateIngress(rules, 'evt-only', 'onFilterChanged')).toBe(true);
      expect(validateIngress(rules, 'evt-only', 'api.getSelectedRows')).toBe(false);
    });
  });

  describe('validateEgress', () => {
    it('allows all outbound actions when egress is undefined', () => {
      expect(validateEgress(undefined, 'detail-grid', GridPermissions.API.GetSelectedRows)).toBe(true);
    });

    it('blocks all outbound actions when egress is an empty array (Deny All)', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      expect(validateEgress([], 'detail-grid', GridPermissions.API.GetSelectedRows)).toBe(false);
      expect(warnSpy).toHaveBeenCalledOnce();
      warnSpy.mockRestore();
    });

    it('validates destiny and permissions with exact and wildcard rules', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const rules: GridEgress[] = [
        {
          destiny: 'detail-grid',
          permissions: [GridPermissions.API.GetSelectedRows, GridPermissions.Manager.Add],
        },
        {
          destiny: 'audit-grid',
          permissions: [GridPermissions.Events.All],
        },
      ];

      expect(validateEgress(rules, 'detail-grid', 'api.getSelectedRows')).toBe(true);
      expect(validateEgress(rules, 'detail-grid', 'manager.add')).toBe(true);
      expect(validateEgress(rules, 'detail-grid', 'manager.remove')).toBe(false);
      expect(validateEgress(rules, 'audit-grid', 'onCellValueChanged')).toBe(true);
      expect(validateEgress(rules, 'untrusted-grid', 'api.getSelectedRows')).toBe(false);
      warnSpy.mockRestore();
    });
  });
});
