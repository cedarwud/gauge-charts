"use client";

import React, { Fragment, useEffect, useRef, useState } from "react";
import "../assets/css/base-station.css";

const BaseStation: React.FC = ({ gain, setGain }) => {
  const [distance, setDistance] = useState(0);

  function mapLogarithmically(input) {
    // 確保輸入在範圍 0 到 200 之間
    const distanceInput = input < 0 ? 0 : input > 200 ? 200 : input;

    // 將輸入範圍 [0, 200] 映射到 [1, e^4] 之間
    const scaledInput = 1 + (distanceInput / 200) * (Math.exp(4) - 1);

    // 計算對數
    const logOutput = Math.log(scaledInput);

    // 將對數結果縮放到輸出範圍 [10, 90]
    const minOutput = 10;
    const maxOutput = 90;
    const normalizedOutput =
      minOutput + (logOutput / 4) * (maxOutput - minOutput);

    return normalizedOutput;
  }

  useEffect(() => {
    setGain(() => {
      const newGain = Math.floor(mapLogarithmically(distance * 100));
      updateGain(newGain);
      return newGain;
    });
  }, [distance]);

  const updateGain = (newGain) => {
    const powerLeft = document.querySelector(".power-left") as HTMLElement;
    const powerRight = document.querySelector(".power-right") as HTMLElement;
    if (powerLeft && powerRight) {
      const percentage = Math.min(Math.max(newGain, 0), 100);
      const scale = percentage < 75 ? 75 : percentage < 100 ? percentage : 100;
      powerLeft.style.setProperty("--gain-scale", `${scale}%`);
      powerRight.style.setProperty("--gain-scale", `${scale}%`);
      powerLeft.style.setProperty("--gain-percentage", `${percentage}%`);
      powerRight.style.setProperty("--gain-percentage", `${percentage}%`);
    }
  };

  const [isDragging, setIsDragging] = useState(false);
  const carRef = useRef<HTMLDivElement>(null);
  const roadRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !carRef.current || !roadRef.current) return;

    const roadRect = roadRef.current.getBoundingClientRect();
    const mouseX = e.clientX - roadRect.left;
    const roadWidth = roadRect.width;

    // Calculate position percentage (0-100)
    let position = (mouseX / roadWidth) * 100;
    position = Math.min(Math.max(position, 0), 85); // Limit to 0-85%

    // Calculate actual distance (0-200m)
    const distance = (position / 85) * 2;

    carRef.current.style.setProperty("--car-position", `${position}%`);
    setDistance(distance);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    // Add mouse up listener to window to handle releases outside the component
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  return (
    <Fragment>
      <h1>整合感測和通訊下之雷達感測協助節能通訊系統</h1>
      <div className="base-station-root">
        <div className="base-station-road">
          <div className="base-station">
            <div className="base-station-body"></div>
            <div className="power-left"></div>
            <div className="power-right"></div>
          </div>
          <h1>{gain}</h1>
        </div>
        <div className="car-road" ref={roadRef} onMouseMove={handleMouseMove}>
          <div
            className="car"
            ref={carRef}
            onMouseDown={handleMouseDown}
            style={{ cursor: isDragging ? "grabbing" : "grab" }}
          >
            <div className="car-body">{distance.toFixed(2)} m</div>
            <div className="wheel front-wheel"></div>
            <div className="wheel back-wheel"></div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default BaseStation;
