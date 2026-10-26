import { GridIngress, GridEgress } from '../types';

function matchesPermission(permissions: string[], action: string): boolean {
    if (permissions.includes('*') || permissions.includes(action)) {
        return true;
    }
    for (const perm of permissions) {
        if (perm.endsWith('*')) {
            const prefix = perm.slice(0, -1);
            if (action.startsWith(prefix)) {
                return true;
            }
        }
    }
    return false;
}

/**
 * Validates if a specific action is permitted from a given origin based on ingress rules.
 *
 * @param ingress - The array of ingress rules defined for the target grid.
 * @param origin - The ID of the grid attempting to perform the action.
 * @param action - The action string (e.g., 'onSelectionChanged', 'manager.reset', 'api.setFilterModel').
 * @returns true if the action is permitted, false otherwise.
 */
export function validateIngress(ingress: GridIngress[] | undefined, origin: string, action: string): boolean {
    if (!ingress) {
        return true;
    }
    if (ingress.length === 0) {
        console.warn(`[Grid Security] Blocked action '${action}' from '${origin}'. Reason: Ingress defined but empty (Deny All).`);
        return false;
    }
    const matchingRules = ingress.filter(rule => rule.origin === origin || rule.origin === '*');
    if (matchingRules.length === 0) {
        if (origin !== 'undefined') {
            console.warn(`[Grid Security] Blocked action '${action}' from '${origin}'. Reason: No ingress rules for this origin.`);
        }
        return false;
    }
    const permitted = matchingRules.some(rule => matchesPermission(rule.permissions, action));
    if (permitted) {
        return true;
    }
    console.warn(`[Grid Security] Blocked action '${action}' from '${origin}'. Reason: Permission denied.`);
    return false;
}

/**
 * Validates if a specific action is permitted to a given destiny based on egress rules.
 *
 * @param egress - The array of egress rules defined for the source grid.
 * @param destiny - The ID of the destination grid receiving or requesting the action.
 * @param action - The action string (e.g., 'api.getSelectedRows', 'manager.add').
 * @returns true if the action is permitted, false otherwise.
 */
export function validateEgress(egress: GridEgress[] | undefined, destiny: string, action: string): boolean {
    if (!egress) {
        return true;
    }
    if (egress.length === 0) {
        console.warn(`[Grid Security] Blocked egress action '${action}' to '${destiny}'. Reason: Egress defined but empty (Deny All).`);
        return false;
    }
    const matchingRules = egress.filter(rule => rule.destiny === destiny || rule.destiny === '*');
    if (matchingRules.length === 0) {
        if (destiny !== 'undefined') {
            console.warn(`[Grid Security] Blocked egress action '${action}' to '${destiny}'. Reason: No egress rules for this destiny.`);
        }
        return false;
    }
    const permitted = matchingRules.some(rule => matchesPermission(rule.permissions, action));
    if (permitted) {
        return true;
    }
    console.warn(`[Grid Security] Blocked egress action '${action}' to '${destiny}'. Reason: Permission denied.`);
    return false;
}

