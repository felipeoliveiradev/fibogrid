import { GridIngress } from '../types';
/**
 * Validates if a specific action is permitted from a given origin based on ingress rules.
 * 
 * @param ingress - The array of ingress rules defined for the grid.
 * @param origin - The ID of the grid attempting to perform the action.
 * @param action - The action string (e.g., 'onSelectionChanged', 'manager.reset').
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
    const rules = ingress.find(rule => rule.origin === origin);
    if (!rules) {
        if (origin !== 'undefined') {
            console.warn(`[Grid Security] Blocked action '${action}' from '${origin}'. Reason: No ingress rules for this origin.`);
        }
        return false;
    }
    if (rules.permissions.includes('*')) {
        return true;
    }
    if (rules.permissions.includes(action)) {
        return true;
    }
    const [scope] = action.split('.');
    if (scope && rules.permissions.includes(`${scope}.*`)) {
        return true;
    }
    if (action.startsWith('api.') && rules.permissions.includes('api.*')) {
        return true;
    }
    console.warn(`[Grid Security] Blocked action '${action}' from '${origin}'. Reason: Permission denied.`);
    return false;
}
