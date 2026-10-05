import { CaretUpFilled } from "@ant-design/icons";
import { useState } from "react";

export default function ToggleComponent({ 
  className, 
  title, 
  children 
}: {
  className?: string, 
  title: string, 
  children: React.ReactNode
}) {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div className={className}>
      {/* 1. Added cursor-pointer so the user knows it's clickable */}
      <div 
        className="bg-slate-50 flex justify-between items-center border-gray-50 rounded-sm p-2 cursor-pointer select-none" 
        onClick={() => setIsVisible(!isVisible)}
      >
        <span>{title}</span>
        {/* 2. Instead of swapping two different icons, we use one icon and rotate it smoothly */}
        <CaretUpFilled
          rev={undefined}
          className={`transition-transform duration-300 ${
            isVisible ? "rotate-180" : "rotate-0"
          }`} 
        />
      </div>

      {/* 3. The Grid Transition Wrapper */}
      <div 
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
          isVisible ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        {/* 4. overflow-hidden is required here so the content doesn't spill out when folded */}
        <div className="overflow-hidden">
          {/* Inner wrapper for spacing so padding doesn't mess up the height calculation */}
          <div className="pt-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
