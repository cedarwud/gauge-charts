"use client";

import React, { Fragment, useEffect, useState } from "react";
import "../assets/css/base-station.css";

const BaseStation: React.FC = () => {
  const [distance, setDistance] = useState(0);
  const [gain, setGain] = useState(10);

  const fetchDistance = async (count) => {
    const res = await fetch("/api/get-distance?count=" + count);
    const data = await res.json();
    setDistance(data.distance);
  };

  function mapLogarithmically(input) {
    // 確保輸入在範圍 0 到 180 之間
    const distanceInput = input < 0 ? 0 : input > 180 ? 180 : input;

    // 將輸入範圍 [0, 180] 映射到 [1, e^4] 之間
    let scaledInput = 1 + (distanceInput / 180) * (Math.exp(4) - 1);

    // 計算對數
    let logOutput = Math.log(scaledInput);

    // 將對數結果縮放到輸出範圍 [10, 90]
    let minOutput = 10;
    let maxOutput = 90;
    let normalizedOutput =
      minOutput + (logOutput / 4) * (maxOutput - minOutput);

    return normalizedOutput;
  }

  useEffect(() => {
    const intervalId = setInterval(() => {
      setDistance((prev) => {
        updateCarPosition(prev + 1);
        setGain(() => {
          const newGain = Math.floor(mapLogarithmically(prev + 1));
          updateGain(newGain);
          return newGain;
        });
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [distance]);

  const updateGain = (newGain) => {
    const powerLeft = document.querySelector('.power-left') as HTMLElement;
    const powerRight = document.querySelector('.power-right') as HTMLElement;
    if (powerLeft && powerRight) {
      const percentage = Math.min(Math.max(newGain, 0), 100);
      powerLeft.style.setProperty('--gain-percentage', `${percentage}%`);
      powerRight.style.setProperty('--gain-percentage', `${percentage}%`);
    }
  };

  const updateCarPosition = (distance: number) => {
    const car = document.querySelector(".car") as HTMLElement;
    if (car) {
      // Convert distance to percentage (assume max distance is 100)
      const position = Math.min(Math.max((distance / 200) * 100, 0), 85);
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
        </div>
        <div className="car-road">
          <div className="car">
            <div className="car-body">User Equipment</div>
            <div className="wheel front-wheel"></div>
            <div className="wheel back-wheel"></div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default BaseStation;
