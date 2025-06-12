/* สร้างไฟล์ใหม่: /Users/itswatthachai/kuku_yibyerm/frontend/components/layout/navigation.tsx */
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, BookOpen, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
  { href: "/", label: "หน้าหลัก" },
  { href: "/dashboard", label: "แดชบอร์ด" },
  { href: "/items", label: "รายการอุปกรณ์" },
  { href: "/help", label: "ช่วยเหลือ" },
];

export function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full",
        "ku-bg-card ku-border backdrop-blur-md border-b",
        "transition-all duration-300"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div
              className={cn(
                "w-10 h-10 rounded-lg ku-gradient",
                "flex items-center justify-center transition-transform",
                "group-hover:scale-105"
              )}
            >
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg ku-text-primary leading-none">
                YibYerm
              </span>
              <span className="text-xs text-muted-foreground">
                ระบบยืม-คืน มหาวิทยาลัยเกษตรศาสตร์
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "transition-all duration-200",
                      isActive && "bg-primary text-primary-foreground",
                      !isActive && "hover:ku-bg-card"
                    )}
                  >
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            <Button variant="ghost" size="sm" className="ku-border">
              <User className="w-4 h-4" />
            </Button>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="ku-bg-card">
                <SheetHeader>
                  <SheetTitle className="ku-text-primary">เมนูหลัก</SheetTitle>
                </SheetHeader>

                <nav className="flex flex-col gap-2 mt-6">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                    >
                      <Button
                        variant={pathname === item.href ? "default" : "ghost"}
                        className="w-full justify-start"
                      >
                        {item.label}
                      </Button>
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
