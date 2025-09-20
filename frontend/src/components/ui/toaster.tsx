"use client"

import { ToastContainer, useToast } from "@/components/ui/toast"

export function Toaster() {
  const { toasts, removeToast } = useToast()

  return (
    <ToastContainer 
      toasts={toasts} 
      onRemove={removeToast}
      position="top-right"
    />
  )
}








