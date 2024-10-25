"use client";

import React, { useEffect, useState } from "react";
import GaugeChart from "react-gauge-chart";
import io from "socket.io-client";

// interface GaugeData {
//     id: number;
//     value: number;
// }

// Initialize the Socket.io client
const socket = io();

const GaugeChartComponent: React.FC = () => {
  //   const [gaugeData, setGaugeData] = useState<GaugeData[]>([]);
  const [gaugeData, setGaugeData] = useState([]);

  useEffect(() => {
    // Listen for 'newData' events from the server
    // socket.on("newData", (data: GaugeData[]) => {
    socket.on("newData", (data) => {
      // console.log(data.data);
      setGaugeData(data.data);
    });

    // Clean up the listener when the component is unmounted
    return () => {
      socket.off("newData");
    };
  }, []);

  const chartStyle = {
    width: 400,
  };

  return (
    <div>
      <h2>Real-Time Gauge Charts</h2>
      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        {gaugeData?.map((item) => (
          <div key={item.id}>
            <GaugeChart
              id={`gauge-chart-${item.id}`}
              style={chartStyle}
              percent={item.value / 100}
            />
            <p>Gauge ID: {item.id}</p>
            <p>Value: {item.value.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GaugeChartComponent;
