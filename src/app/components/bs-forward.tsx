"use client";

import React, { Fragment, useEffect, useState } from "react";
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
    const intervalId = setInterval(() => {
      setDistance((prev) => {
        const newDistance = prev + 0.01 <= 3 ? prev + 0.01 : 3;
        updateCarPosition(newDistance);
        setGain(() => {
          const newGain = Math.floor(mapLogarithmically(distance * 100));
          updateGain(newGain);
          return newGain;
        });
        return newDistance;
      });
    }, 100);
    return () => clearInterval(intervalId);
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

  const updateCarPosition = (distance: number) => {
    const car = document.querySelector(".car") as HTMLElement;
    if (car) {
      // Convert distance to percentage (assume max distance is 85)
      const position = Math.min(Math.max((distance / 3.4) * 100, 0), 85);
      car.style.setProperty("--car-position", `${position}%`);
    }
  };

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
        <div className="car-road">
          <div className="car">
            <div className="car-body">{distance.toFixed(2)}m</div>
            <div className="wheel front-wheel"></div>
            <div className="wheel back-wheel"></div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default BaseStation;
