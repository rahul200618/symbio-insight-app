import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

export function BarChart({ data }) {
  const maxValue = Math.max(...data.map(d => d.value));
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Reset animation when data changes
    setIsVisible(false);
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, [JSON.stringify(data)]); // Re-run when data changes

  return (
    <div className="w-full h-full flex items-end justify-around gap-4 px-2">
      {data.map((item, index) => {
        const height = (item.value / maxValue) * 100;
        return (
          <div key={`${item.name}-${index}`} className="flex-1 flex flex-col items-center">
            <div className="w-full flex items-end h-full relative mb-4">
              <motion.div
                className="w-full rounded-lg shadow-lg"
                style={{
                  backgroundColor: item.color,
                  minHeight: '32px',
                }}
                initial={{
                  height: 0,
                  opacity: 0,
                  scaleY: 0,
                  transformOrigin: 'bottom'
                }}
                animate={isVisible ? {
                  height: `${height}%`,
                  opacity: 1,
                  scaleY: 1
                } : {
                  height: 0,
                  opacity: 0,
                  scaleY: 0
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                  mass: 0.8,
                  delay: index * 0.1,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function PieChart({ data }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = -90;

  const slices = data.map((item) => {
    const percentage = item.value / total;
    const angle = percentage * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    return {
      ...item,
      startAngle,
      endAngle,
      percentage,
    };
  });

  const createArc = (startAngle, endAngle, innerRadius, outerRadius) => {
    const start = polarToCartesian(100, 100, outerRadius, endAngle);
    const end = polarToCartesian(100, 100, outerRadius, startAngle);
    const innerStart = polarToCartesian(100, 100, innerRadius, endAngle);
    const innerEnd = polarToCartesian(100, 100, innerRadius, startAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    const d = [
      'M', start.x, start.y,
      'A', outerRadius, outerRadius, 0, largeArcFlag, 0, end.x, end.y,
      'L', innerEnd.x, innerEnd.y,
      'A', innerRadius, innerRadius, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
      'Z'
    ].join(' ');

    return d;
  };

  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      {slices.map((slice, index) => (
        <path
          key={index}
          d={createArc(slice.startAngle, slice.endAngle, 50, 80)}
          fill={slice.color}
        />
      ))}
    </svg>
  );
}
