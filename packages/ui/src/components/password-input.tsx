"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState, type InputHTMLAttributes, type MouseEvent } from "react";

import { cn } from "../lib/utils";

export interface PasswordInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  containerClassName?: string;
}

export function PasswordInput({
  className,
  containerClassName,
  disabled,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const actionLabel = visible ? "隐藏密码" : "显示密码";

  function preserveInputFocus(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
  }

  return (
    <div className={cn("relative mt-2", containerClassName)}>
      <input
        {...props}
        className={cn(
          "min-h-11 w-full rounded-control border border-border bg-background py-2 pl-3 pr-12",
          className,
        )}
        disabled={disabled}
        type={visible ? "text" : "password"}
      />
      <button
        aria-label={actionLabel}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 inline-flex min-h-11 w-11 items-center justify-center rounded-r-control text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground active:bg-surface-muted focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none"
        disabled={disabled}
        onClick={() => setVisible((current) => !current)}
        onMouseDown={preserveInputFocus}
        title={actionLabel}
        type="button"
      >
        {visible ? (
          <EyeOff aria-hidden="true" size={18} />
        ) : (
          <Eye aria-hidden="true" size={18} />
        )}
      </button>
    </div>
  );
}
