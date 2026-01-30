"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "antd";

export default function FeatureCard({ icon, title, description, delay = 0 }) {
  const [isInView, setIsInView] = useState(false);
  const cardRef = useRef(null);
  const hasAnimatedRef = useRef(false);

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
      { threshold: 0.15, rootMargin: "0px 0px -30px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className={`transition-all duration-600 ease-out ${
        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <Card className="text-center h-full border-none shadow-md hover:shadow-lg transition-shadow flex flex-col">
        <div className="flex flex-col items-center gap-4 grow">
          <div className="text-5xl text-green-600 mb-2">{icon}</div>
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <p className="text-gray-600 leading-relaxed line-clamp-4 min-h-24">
            {description}
          </p>
        </div>
      </Card>
    </div>
  );
}
