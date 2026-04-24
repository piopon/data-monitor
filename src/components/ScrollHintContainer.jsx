"use client";

import { useCallback, useEffect, useState } from "react";

export default function ScrollHintContainer({
  children,
  as = "section",
  className = "",
  hintText = "More content below, scroll down",
  hideScrollbar = true,
  threshold = 8,
  ...rest
}) {
  const [containerNode, setContainerNode] = useState(null);
  const [contentNode, setContentNode] = useState(null);
  const [showHint, setShowHint] = useState(false);

  const handleContainerRef = useCallback((node) => {
    setContainerNode(node);
  }, []);

  const handleContentRef = useCallback((node) => {
    setContentNode(node);
  }, []);

  useEffect(() => {
    if (containerNode == null) {
      return;
    }

    const updateHintVisibility = () => {
      const remaining = containerNode.scrollHeight - containerNode.clientHeight - containerNode.scrollTop;
      setShowHint(containerNode.scrollHeight > containerNode.clientHeight && remaining > threshold);
    };

    updateHintVisibility();
    containerNode.addEventListener("scroll", updateHintVisibility, { passive: true });
    window.addEventListener("resize", updateHintVisibility);

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(updateHintVisibility)
        : null;
    if (contentNode != null) {
      resizeObserver?.observe(contentNode);
    }

    const mutationObserver =
      typeof MutationObserver !== "undefined"
        ? new MutationObserver(updateHintVisibility)
        : null;
    if (contentNode != null) {
      mutationObserver?.observe(contentNode, { childList: true, subtree: true, characterData: true });
    }

    const delayedCheck = window.setTimeout(updateHintVisibility, 250);

    return () => {
      containerNode.removeEventListener("scroll", updateHintVisibility);
      window.removeEventListener("resize", updateHintVisibility);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      window.clearTimeout(delayedCheck);
    };
  }, [containerNode, contentNode, threshold]);

  const scrollAreaClasses = ["scroll-hint-container", hideScrollbar ? "scroll-hint-container--hide-scrollbar" : ""]
    .filter(Boolean)
    .join(" ");

  const rootClasses = ["relative h-full w-full min-h-0", className].filter(Boolean).join(" ");

  const Root = as;

  return (
    <Root className={rootClasses} {...rest}>
      <div ref={handleContainerRef} className={scrollAreaClasses}>
        <div ref={handleContentRef} className="scroll-hint-content">
          {children}
        </div>
      </div>
      {showHint ? <div className="scroll-hint-badge">{hintText}</div> : null}
    </Root>
  );
}
