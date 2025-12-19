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
    // 1. If no ingress rules are defined (Open Mode), allow everything.
    if (!ingress) {
        return true;
    }

    // 2. If ingress is defined (even empty array), Strict Mode is active.
    if (ingress.length === 0) {
        console.warn(`[Grid Security] Blocked action '${action}' from '${origin}'. Reason: Ingress defined but empty (Deny All).`);
        return false;
    }

    const rules = ingress.find(rule => rule.origin === origin);

    if (!rules) {
        // If it's the internal 'undefined' origin (implicit call) and no rule exists,
        // we might want to allow it IF we decide internal components are trusted.
        // BUT current design enforces strictness.
        // If the user wants to allow anonymous calls, they must add { origin: 'undefined', ... }

        // Debug log to help users
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

    // Check for wildcards like 'manager.*'
    const [scope] = action.split('.');
    if (scope && rules.permissions.includes(`${scope}.*`)) {
        return true;
    }

    // Check for 'api.*' wildcard specifically if action starts with api
    if (action.startsWith('api.') && rules.permissions.includes('api.*')) {
        return true;
    }

    console.warn(`[Grid Security] Blocked action '${action}' from '${origin}'. Reason: Permission denied.`);
    return false;
}
