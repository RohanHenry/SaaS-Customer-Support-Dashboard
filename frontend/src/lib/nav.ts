import {
  LayoutDashboard,
  Ticket,
  Users,
  Headset,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "./types";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** If set, only these roles see the link. Omitted = everyone sees it. */
  roles?: UserRole[];
}

/**
 * Single source of truth for the sidebar links.
 * Role-gating here is for UX (hide what you can't use). The backend still
 * enforces real permissions on every endpoint.
 */
export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Tickets", href: "/dashboard/tickets", icon: Ticket },
  {
    label: "Customers",
    href: "/dashboard/customers",
    icon: Users,
    roles: ["ADMIN", "SUPPORT_AGENT"],
  },
  {
    label: "Agents",
    href: "/dashboard/agents",
    icon: Headset,
    roles: ["ADMIN"],
  },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

/** Filter nav items down to the ones a given role may see. */
export function navItemsForRole(role: UserRole): NavItem[] {
  return NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role));
}
