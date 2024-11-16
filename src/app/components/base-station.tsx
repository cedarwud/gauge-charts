"use client";

import React, { Fragment, useEffect, useState } from "react";
import "../assets/css/base-station.css";

const BaseStation: React.FC = () => {
  const [disCount, setDisCount] = useState(0);
  const [distance, setDistance] = useState(0);
  const [gain, setGain] = useState(1);

  const fetchDistance = async (count) => {
    const res = await fetch("/api/get-distance?count=" + count);
    const data = await res.json();
    setDistance(data.distance);
    setDisCount((prevCount) => prevCount + 1);
  };

  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     setDistance((prev) => {
  //       updateCarPosition(prev + 1);
  //       return prev + 1;
  //     });
  //   }, 1000);

  //   return () => clearInterval(intervalId);
  // }, [distance]);

  useEffect(() => {
    const newGain = distance > 0 ? Math.min(distance / 10, 10) : 1;
    setGain(newGain);
  }, [distance]);

  const updateCarPosition = (distance: number) => {
    const car = document.querySelector(".car") as HTMLElement;
    if (car) {
      // Convert distance to percentage (assume max distance is 100)
      const position = Math.min(Math.max((distance / 200) * 100, 0), 88);
      car.style.setProperty("--car-position", `${position}%`);
    }
  };

  return (
    <Fragment>
      <button onClick={() => updateCarPosition(1)}>Update Car Position</button>
      <button onClick={() => updateCarPosition(2)}>Update Car Position</button>
      <h1>整合感測和通訊下之雷達感測協助節能通訊系統</h1>
      <div className="road">
        <div className="car">
          <div className="car-body">User Equipment</div>
          <div className="wheel front-wheel"></div>
          <div className="wheel back-wheel"></div>
        </div>
      </div>
    </Fragment>
  );
};

export default BaseStation;
