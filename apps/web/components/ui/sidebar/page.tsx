"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {

  Menu,
  X,
  CircleQuestionMark,
  UserRound, Plus
} from "lucide-react";
import { SvgIcon } from "../svgIcon/page";



const navigation = [
  {
    name: "Overview", href: "/dashboard", icon: SvgIcon({
      svg:
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 6V0H18V6H10ZM0 10V0H8V10H0ZM10 18V8H18V18H10ZM0 18V12H8V18H0ZM2 8H6V2H2V8ZM12 16H16V10H12V16ZM12 4H16V2H12V4ZM2 16H6V14H2V16Z" fill="#ADC6FF" />
        </svg>

    })
  },
  {
    name: "Workflows", href: "/workflows/all", icon: SvgIcon({
      svg:
        <svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 18V15H9V5H7V8H0V0H7V3H13V0H20V8H13V5H11V13H13V10H20V18H13ZM2 2V6V2ZM15 12V16V12ZM15 2V6V2ZM15 6H18V2H15V6ZM15 16H18V12H15V16ZM2 6H5V2H2V6Z" fill="#C2C6D6" />
        </svg>


    })
  },
 

  {
    name: "Incidents", href: "/investigate", icon: SvgIcon({
      svg: <svg width="20" height="19" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.6 19L13.9 14.3C13.2167 14.8333 12.4625 15.25 11.6375 15.55C10.8125 15.85 9.93333 16 9 16C7.5 16 6.14583 15.6333 4.9375 14.9C3.72917 14.1667 2.775 13.2 2.075 12H4.525C5.09167 12.6167 5.75417 13.1042 6.5125 13.4625C7.27083 13.8208 8.1 14 9 14C10.6667 14 12.0833 13.4167 13.25 12.25C14.4167 11.0833 15 9.66667 15 8C15 6.33333 14.4167 4.91667 13.25 3.75C12.0833 2.58333 10.6667 2 9 2C7.43333 2 6.07917 2.52917 4.9375 3.5875C3.79583 4.64583 3.15833 5.95 3.025 7.5H1.025C1.15833 5.38333 1.9875 3.60417 3.5125 2.1625C5.0375 0.720833 6.86667 0 9 0C11.2333 0 13.125 0.775 14.675 2.325C16.225 3.875 17 5.76667 17 8C17 8.93333 16.85 9.8125 16.55 10.6375C16.25 11.4625 15.8333 12.2167 15.3 12.9L20 17.6L18.6 19ZM7.925 12L6.35 6.8L5.05 10.5H0V9H4L5.65 4.25H7.15L8.675 9.35L9.75 6H11.25L12.75 9H13.5V10.5H11.825L10.65 8.15L9.4 12H7.925Z" fill="#C2C6D6" />
      </svg>

    })
  },
  {
    name: "History", href: "/history", icon: SvgIcon({
      svg: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 18C6.7 18 4.69583 17.2375 2.9875 15.7125C1.27917 14.1875 0.3 12.2833 0.05 10H2.1C2.33333 11.7333 3.10417 13.1667 4.4125 14.3C5.72083 15.4333 7.25 16 9 16C10.95 16 12.6042 15.3208 13.9625 13.9625C15.3208 12.6042 16 10.95 16 9C16 7.05 15.3208 5.39583 13.9625 4.0375C12.6042 2.67917 10.95 2 9 2C7.85 2 6.775 2.26667 5.775 2.8C4.775 3.33333 3.93333 4.06667 3.25 5H6V7H0V1H2V3.35C2.85 2.28333 3.8875 1.45833 5.1125 0.875C6.3375 0.291667 7.63333 0 9 0C10.25 0 11.4208 0.2375 12.5125 0.7125C13.6042 1.1875 14.5542 1.82917 15.3625 2.6375C16.1708 3.44583 16.8125 4.39583 17.2875 5.4875C17.7625 6.57917 18 7.75 18 9C18 10.25 17.7625 11.4208 17.2875 12.5125C16.8125 13.6042 16.1708 14.5542 15.3625 15.3625C14.5542 16.1708 13.6042 16.8125 12.5125 17.2875C11.4208 17.7625 10.25 18 9 18ZM11.8 13.2L8 9.4V4H10V8.6L13.2 11.8L11.8 13.2Z" fill="#C2C6D6" />
      </svg>

    })
  },
  
  
  {
    name: "Settings", href: "/settings", icon: SvgIcon({
      svg: <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.3 20L6.9 16.8C6.68333 16.7167 6.47917 16.6167 6.2875 16.5C6.09583 16.3833 5.90833 16.2583 5.725 16.125L2.75 17.375L0 12.625L2.575 10.675C2.55833 10.5583 2.55 10.4458 2.55 10.3375C2.55 10.2292 2.55 10.1167 2.55 10C2.55 9.88333 2.55 9.77083 2.55 9.6625C2.55 9.55417 2.55833 9.44167 2.575 9.325L0 7.375L2.75 2.625L5.725 3.875C5.90833 3.74167 6.1 3.61667 6.3 3.5C6.5 3.38333 6.7 3.28333 6.9 3.2L7.3 0H12.8L13.2 3.2C13.4167 3.28333 13.6208 3.38333 13.8125 3.5C14.0042 3.61667 14.1917 3.74167 14.375 3.875L17.35 2.625L20.1 7.375L17.525 9.325C17.5417 9.44167 17.55 9.55417 17.55 9.6625C17.55 9.77083 17.55 9.88333 17.55 10C17.55 10.1167 17.55 10.2292 17.55 10.3375C17.55 10.4458 17.5333 10.5583 17.5 10.675L20.075 12.625L17.325 17.375L14.375 16.125C14.1917 16.2583 14 16.3833 13.8 16.5C13.6 16.6167 13.4 16.7167 13.2 16.8L12.8 20H7.3ZM9.05 18H11.025L11.375 15.35C11.8917 15.2167 12.3708 15.0208 12.8125 14.7625C13.2542 14.5042 13.6583 14.1917 14.025 13.825L16.5 14.85L17.475 13.15L15.325 11.525C15.4083 11.2917 15.4667 11.0458 15.5 10.7875C15.5333 10.5292 15.55 10.2667 15.55 10C15.55 9.73333 15.5333 9.47083 15.5 9.2125C15.4667 8.95417 15.4083 8.70833 15.325 8.475L17.475 6.85L16.5 5.15L14.025 6.2C13.6583 5.81667 13.2542 5.49583 12.8125 5.2375C12.3708 4.97917 11.8917 4.78333 11.375 4.65L11.05 2H9.075L8.725 4.65C8.20833 4.78333 7.72917 4.97917 7.2875 5.2375C6.84583 5.49583 6.44167 5.80833 6.075 6.175L3.6 5.15L2.625 6.85L4.775 8.45C4.69167 8.7 4.63333 8.95 4.6 9.2C4.56667 9.45 4.55 9.71667 4.55 10C4.55 10.2667 4.56667 10.525 4.6 10.775C4.63333 11.025 4.69167 11.275 4.775 11.525L2.625 13.15L3.6 14.85L6.075 13.8C6.44167 14.1833 6.84583 14.5042 7.2875 14.7625C7.72917 15.0208 8.20833 15.2167 8.725 15.35L9.05 18ZM10.1 13.5C11.0667 13.5 11.8917 13.1583 12.575 12.475C13.2583 11.7917 13.6 10.9667 13.6 10C13.6 9.03333 13.2583 8.20833 12.575 7.525C11.8917 6.84167 11.0667 6.5 10.1 6.5C9.11667 6.5 8.2875 6.84167 7.6125 7.525C6.9375 8.20833 6.6 9.03333 6.6 10C6.6 10.9667 6.9375 11.7917 7.6125 12.475C8.2875 13.1583 9.11667 13.5 10.1 13.5Z" fill="#C2C6D6" />
      </svg>

    })
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Hamburger Button */}
      <div className="flex items-center justify-between bg-gray-900 px-4 py-2 text-gray-100 md:hidden font-sans ">
        <span className="text-xl font-bold tracking-wider">FlowLens</span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar Container */}
      <div className={` 
        fixed inset-y-0 left-0 z-40 w-52 transform bg-transparent shadow-lg backdrop-blur-xl backdrop-saturate-150 text-gray-100 transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:flex md:flex-col 
        ${isOpen ? "translate-x-0" : "-translate-x-full"} scrollbar
      `}>

        {/* Header / Logo */}
        <div className="border-b border-border px-6 py-6">
          <Link
            href="/dashboard"
            className=" flex text-2xl font-bold tracking-tight text-brand-orange"
          >
            <div className="flex h-9 w-9  sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-surface overflow-hidden ">
              <img
                src="/logo.png"
                alt="FlowLens Logo"
                width={70}
                height={70}
              />
            </div>
            FlowLens
          </Link>

          <p className="mt-1 text-sm text-inactive">
            AI Automation Detective
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-5 text-xs">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 text-xs font-medium transition-colors
                  ${isActive
                    ? "bg-surface-2 border-l-4 border-brand-orange text-brand-orange"
                    : "text-inactive hover:bg-surface-2 hover:border-l-4 hover:border-brand-orange hover:text-text-primary"
                  }
                `}
              >
                {item.icon}

                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="px-2 pb-3">
          <Link
            href="/workflows"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-orange px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <Plus size={20} strokeWidth={2.5} />
            Import New
          </Link>
        </div>
        {/* Profile Footer */}
        <div className="border-t border-border p-4 space-y-1 text-sm">

          <Link
            href="/support"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-inactive transition hover:bg-surface-2 hover:text-text-primary"
          >
            <CircleQuestionMark size={20} />
            <span>Support</span>
          </Link>

          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-inactive transition hover:bg-surface-2 hover:text-text-primary"
          >
            <UserRound size={20} />
            <span>Account</span>
          </Link>

        </div>

      </div>

      {/* Mobile Overlay Background */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-surface/50 md:hidden"
        />
      )}
    </>
  );
}