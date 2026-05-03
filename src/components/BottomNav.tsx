import { Link, useLocation } from "@tanstack/react-router";
import { Home, Sparkles, Ticket, User } from "lucide-react";

export function BottomNav() {
  const location = useLocation();
  const path = location.pathname;

  const items = [
    { to: "/dashboard", icon: Home, label: "Home" },
    { to: "/recommendations", icon: Sparkles, label: "For You" },
    { to: "/vouchers", icon: Ticket, label: "Vouchers" },
    { to: "/profile", icon: User, label: "Profile" },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card">
      <div className="mx-auto flex max-w-md items-center justify-around py-2">
        {items.map((item) => {
          const active = path === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-semibold transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon className={`h-5 w-5 ${active ? "text-primary" : ""}`} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}