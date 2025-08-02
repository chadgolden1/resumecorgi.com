import React from "react";

interface AlertProps {
  title: string;
  description: React.ReactNode;
  variant: "success" | "danger" | "info" | "warning";
  additionalContent?: React.ReactNode
}

export const Alert = ({title, description, variant = "success", additionalContent}: AlertProps) => {
  const alertStyle = {
    "success": "bg-lime-200 dark:bg-lime-700 border-lime-600 text-gray-900 dark:border-lime-500 dark:text-white dark:shadow-zinc-900",
    "danger": "bg-rose-200 dark:bg-rose-700 border-rose-600 text-gray-900 dark:border-rose-400 dark:text-white dark:shadow-zinc-900",
    "info": "bg-sky-200 dark:bg-blue-700 border-sky-600 text-gray-900 dark:border-blue-500 dark:text-white dark:shadow-zinc-900",
    "warning": "bg-amber-200 dark:bg-amber-700 border-amber-600 text-gray-900 dark:border-amber-500 dark:text-white dark:shadow-zinc-900",
  }

  return (
    <>
      <div className={`${alertStyle[variant]} border-l-5 p-3 shadow-xs`} role="alert">
        <p className="font-bold">{title}</p>
        <p className="text-sm">{description}</p>
        <div hidden={!additionalContent}>
          { additionalContent }
        </div>
      </div>
    </>
  )
}