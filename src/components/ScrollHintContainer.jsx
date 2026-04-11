"use client";

import { useEffect, useRef, useState } from "react";

export default function ScrollHintContainer({
  children,
  className = "",
  hintText = "More content below, scroll down",
  hideScrollbar = true,
  threshold = 8,
}) {
  const containerRef = useRef(null);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (container == null) {
      return;
    }

    const updateHintVisibility = () => {
      const remaining = container.scrollHeight - container.clientHeight - container.scrollTop;
      setShowHint(container.scrollHeight > container.clientHeight && remaining > threshold);
    };

    updateHintVisibility();
    container.addEventListener("scroll", updateHintVisibility, { passive: true });
    window.addEventListener("resize", updateHintVisibility);

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(updateHintVisibility)
        : null;
    observer?.observe(container);

    const delayedCheck = window.setTimeout(updateHintVisibility, 250);

    return () => {
      container.removeEventListener("scroll", updateHintVisibility);
      window.removeEventListener("resize", updateHintVisibility);
      observer?.disconnect();
      window.clearTimeout(delayedCheck);
    };
  }, [threshold]);

  const classes = ["scroll-hint-container", hideScrollbar ? "scroll-hint-container--hide-scrollbar" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <section ref={containerRef} className={classes}>
      {children}
      {showHint ? <div className="scroll-hint-badge">{hintText}</div> : null}
    </section>
  );
}
