

export function BarChart({ data }) {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="w-full h-full flex items-end justify-around gap-4 px-8 pb-4">
      {data.map((item, index) => {
        const height = (item.value / maxValue) * 100;
        return (
          <div key={index} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex items-end" style={{ height: '160px' }}>
              <div
                className="w-full rounded-t-lg transition-all"
                style={{
                  height: `${height}%`,
                  backgroundColor: item.color,
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

