/**
 * Centralized admin permission matrix.
 * Hardcoded role-based permissions for Phase 1.
 */

export type Resource =
  | "dashboard" | "products" | "categories" | "brands"
  | "orders" | "customers" | "users" | "payments"
  | "shipping" | "coupons" | "catalogs" | "settings"
  | "audit_log" | "system";

export type Action = "read" | "write";

const MATRIX: Record<string, Partial<Record<Resource, Action[]>>> = {
  ADMIN: {
    dashboard: ["read"], products: ["read", "write"], categories: ["read", "write"],
    brands: ["read", "write"], orders: ["read", "write"], customers: ["read"],
    users: ["read", "write"], payments: ["read"], shipping: ["read", "write"],
    coupons: ["read", "write"], catalogs: ["read", "write"], settings: ["read", "write"],
    audit_log: ["read"], system: ["read", "write"],
  },
  STAFF: {
    dashboard: ["read"], products: ["read", "write"], categories: ["read", "write"],
    brands: ["read", "write"], orders: ["read", "write"], customers: ["read"],
    payments: ["read"], catalogs: ["read", "write"],
  },
};

export function hasPermission(role: string, resource: Resource, action: Action): boolean {
  return (MATRIX[role]?.[resource] || []).includes(action);
}

export function getPermissions(role: string): string[] {
  const perms = MATRIX[role];
  if (!perms) return [];
  return Object.entries(perms)
    .filter(([, actions]) => actions.length > 0)
    .map(([r]) => r);
}

export function getStaffHiddenSections(): string[] {
  return ["users", "settings", "shipping", "coupons", "audit_log"];
}
