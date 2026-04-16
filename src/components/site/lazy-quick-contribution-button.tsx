"use client";

import {
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentType,
} from "react";
import { UploadSimple } from "@phosphor-icons/react";

import { Button, linkButtonClassName } from "@/components/ui/button";
import type { QuickContributionButtonProps } from "@/components/site/quick-contribution-button";
import { cn } from "@/lib/utils";

type QuickContributionButtonComponent = ComponentType<QuickContributionButtonProps>;

let quickContributionButtonLoader:
  | Promise<QuickContributionButtonComponent>
  | null = null;

function runWhenIdle(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  if ("requestIdleCallback" in window) {
    const idleHandle = window.requestIdleCallback(callback, { timeout: 1200 });
    return () => window.cancelIdleCallback(idleHandle);
  }

  const timeoutHandle = globalThis.setTimeout(callback, 320);
  return () => globalThis.clearTimeout(timeoutHandle);
}

async function loadQuickContributionButton() {
  if (!quickContributionButtonLoader) {
    quickContributionButtonLoader = import(
      "@/components/site/quick-contribution-button"
    ).then((mod) => mod.QuickContributionButton);
  }

  return quickContributionButtonLoader;
}

function FallbackQuickContributionButton({
  className,
  disabled = false,
  variant = "primary",
  size = "md",
  label = "Đóng góp",
  compact = false,
  onTrigger,
}: QuickContributionButtonProps & { onTrigger: () => void }) {
  const icon = <UploadSimple className="h-4 w-4" weight="bold" />;

  if (compact) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={onTrigger}
        onPointerEnter={onTrigger}
        onFocus={onTrigger}
        className={cn(linkButtonClassName({ className, variant, size }))}
      >
        {icon}
        {label}
      </button>
    );
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      disabled={disabled}
      icon={icon}
      onClick={onTrigger}
      onPointerEnter={onTrigger}
      onFocus={onTrigger}
    >
      {label}
    </Button>
  );
}

export function LazyQuickContributionButton(
  props: QuickContributionButtonProps
) {
  const [Component, setComponent] =
    useState<QuickContributionButtonComponent | null>(null);
  const [autoOpenSignal, setAutoOpenSignal] = useState(0);
  const isMountedRef = useRef(true);

  const warmupComponent = useCallback(async () => {
    const LoadedComponent = await loadQuickContributionButton();

    if (!isMountedRef.current) {
      return;
    }

    startTransition(() => {
      setComponent(() => LoadedComponent);
    });
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    const cancelIdle = runWhenIdle(() => {
      void warmupComponent();
    });

    return () => {
      isMountedRef.current = false;
      cancelIdle();
    };
  }, [warmupComponent]);

  const handleTrigger = useCallback(() => {
    if (props.disabled) {
      return;
    }

    setAutoOpenSignal((value) => value + 1);
    void warmupComponent();
  }, [props.disabled, warmupComponent]);

  if (Component) {
    return <Component {...props} autoOpenSignal={autoOpenSignal} />;
  }

  return <FallbackQuickContributionButton {...props} onTrigger={handleTrigger} />;
}
