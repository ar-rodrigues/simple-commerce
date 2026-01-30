"use client";

import { useState, useEffect, useRef } from "react";

const DURATION_MS = 1500;

function parseValueFormat(valueStr) {
  const prefix = valueStr.trimStart().startsWith("+") ? "+" : "";
  const suffix = valueStr.includes("%") ? "%" : "";
  const useCommas = valueStr.includes(",");
  return { prefix, suffix, useCommas };
}

function formatCount(n, { prefix, suffix, useCommas }) {
  const integer = Math.round(n);
  const numStr = useCommas ? integer.toLocaleString("es-MX") : String(integer);
  return `${prefix}${numStr}${suffix}`;
}

export default function StatCard({ value, label, countEnd, delay = 0 }) {
  const [isInView, setIsInView] = useState(false);
  const [displayValue, setDisplayValue] = useState(
    countEnd != null ? formatCount(0, parseValueFormat(value)) : value
  );
  const cardRef = useRef(null);
  const hasAnimatedRef = useRef(false);
  const countUpDoneRef = useRef(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        if (hasAnimatedRef.current) return;
        hasAnimatedRef.current = true;
        setIsInView(true);
      },
      { threshold: 0.2, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView || countEnd == null || countUpDoneRef.current) return;
    countUpDoneRef.current = true;

    const format = parseValueFormat(value);
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / DURATION_MS, 1);
      const eased = 1 - (1 - progress) ** 2;
      const current = Math.min(countEnd * eased, countEnd);
      setDisplayValue(formatCount(current, format));

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        setDisplayValue(formatCount(countEnd, format));
      }
    }

    requestAnimationFrame(tick);
  }, [isInView, countEnd, value]);

  const valueToShow = countEnd != null ? displayValue : value;

  return (
    <div
      ref={cardRef}
      className={`text-center h-full flex flex-col justify-center transition-all duration-700 ease-out ${
        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="text-4xl md:text-5xl font-bold text-green-600 mb-2 min-h-[1.2em] flex items-center justify-center">
        {valueToShow}
      </div>
      <div className="text-lg text-gray-600 min-h-[2.5rem] flex items-center justify-center">
        {label}
      </div>
    </div>
  );
}
