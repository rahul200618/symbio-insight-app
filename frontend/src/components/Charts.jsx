import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

export function BarChart({ data }) {
  const maxValue = Math.max(...data.map(d => d.value)) || 100; // Prevent division by zero
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(false);
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, [JSON.stringify(data)]);

  return (
    <div className="w-full h-full flex items-end justify-between gap-3 px-2">
      {data.map((item, index) => {
        const height = (item.value / maxValue) * 100;
        return (
          <div key={`${item.name}-${index}`} className="flex-1 flex flex-col items-center h-full justify-end group">
            <div className="w-full relative flex items-end h-full">
              <motion.div
                className="w-full rounded-t-lg shadow-sm group-hover:opacity-90 transition-opacity"
                style={{
                  backgroundColor: item.color,
                }}
                initial={{ height: 0 }}
                animate={{ height: isVisible ? `${height}%` : 0 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                  delay: index * 0.1,
                }}
              >
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded pointer-events-none transition-opacity whitespace-nowrap z-10">
                  {item.value.toFixed(1)}%
                </div>
              </motion.div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function PieChart({ data }) {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1; // Prevent division by zero
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
    // Handle full circle case
    if (endAngle - startAngle >= 360) {
      endAngle = startAngle + 359.99;
    }

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
    <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
      {slices.map((slice, index) => (
        <path
          key={index}
          d={createArc(slice.startAngle, slice.endAngle, 55, 85)}
          fill={slice.color}
          className="hover:opacity-90 transition-opacity cursor-pointer"
        />
      ))}
    </svg>
  );
}
