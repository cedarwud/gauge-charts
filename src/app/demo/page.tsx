"use client";

import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import GaugeChart from "react-gauge-chart";
import { debounce } from "lodash";
import Image from "next/image";
import "../assets/css/demo.css";

import awr1642Image from "../assets/images/radar.jpg";
import usrpB210Image from "../assets/images/usrp.jpg";

// const SOCKET_SERVER_URL = "http://localhost:3000";
const SOCKET_SERVER_URL = "https://gauge-charts.onrender.com";

interface DeviceData {
  voltage: number;
  current: number;
  power: number;
  accumulatedPower: number;
}

const Dashboard: React.FC = () => {
  const maxVoltage = 15;
  const [usrpCurrentPercent, setUsrpCurrentPercent] = useState(0.05);
  const [usrpPowerPercent, setUsrpPowerPercent] = useState(0.05);
  const [radarAccPowerPercent, setRadarAccPowerPercent] = useState(0.05);
  const [usrpAccPowerPercent, setUsrpAccPowerPercent] = useState(0.05);
  const [totalAccPowerPercent, setTotalAccPowerPercent] = useState(0.05);
  const [usrpCurrentOffset, setUsrpCurrentOffset] = useState(0);

  const [radarData, setRadarData] = useState<DeviceData>({
    voltage: 5.07,
    current: 563.83,
    power: 2858.62,
    accumulatedPower: 0,
  });

  const [usrpData, setUsrpData] = useState<DeviceData>({
    voltage: 5.01,
    current: 500.58,
    power: 2502.9,
    accumulatedPower: 0,
  });

  const adjustCurrent = (amount: number) => {
    const newUsrpData = {
      ...usrpData,
      current: usrpData.current + amount,
      power:usrpData.power + amount * 5.01,
    };
    handleNewData(newUsrpData); // Update state with the received data
  };

  const handleNewData = debounce((usrpData) => {
    setUsrpData((prevData) => {
      const newPower = prevData.current * 5.01;
      const usrpAccPowerPercent =
        ((prevData.accumulatedPower + newPower) / 1900) * 0.01;
      const newUsrpAccPowerPercent =
        usrpAccPowerPercent > 1
          ? 0.95
          : usrpAccPowerPercent < 0
          ? 0.05
          : usrpAccPowerPercent;
      setUsrpAccPowerPercent(newUsrpAccPowerPercent);

      return {
        ...usrpData,
        power: newPower,
        accumulatedPower: prevData.accumulatedPower + newPower,
      };
    });

    const usrpCurrentPercent =
      (usrpData.current + usrpCurrentOffset - 500)  / 100;
    const newUsrpCurrentPercent =
      usrpCurrentPercent > 1
        ? 0.95
        : usrpCurrentPercent < 0
        ? 0.05
        : usrpCurrentPercent;
    setUsrpCurrentPercent(newUsrpCurrentPercent);

    const usrpPowerPercent = (usrpData.power - 2500) / 500;
    const newUsrpPowerPercent =
      usrpPowerPercent > 1
        ? 0.95
        : usrpPowerPercent < 0
        ? 0.05
        : usrpPowerPercent;
    setUsrpPowerPercent(newUsrpPowerPercent);

    const totalAccPowerPercent =
      (radarAccPowerPercent + usrpAccPowerPercent) / 3;
    const newTotalAccPowerPercent =
      totalAccPowerPercent > 1
        ? 0.95
        : totalAccPowerPercent < 0
        ? 0.05
        : totalAccPowerPercent;
    setTotalAccPowerPercent(newTotalAccPowerPercent);
  }, 1000);

  return (
    <div className="dashboard-container">
      <h1>Base Station Dashboard</h1>
      <div className="device-section">
        <div>
          <p>AWR1642BOOST-ODS</p>
          <Image
            src={awr1642Image.src}
            alt="AWR1642BOOST-ODS"
            className="device-image"
            width={300}
            height={200}
            priority
          />
        </div>
        <div>
          <p>USRP B210</p>
          <Image
            src={usrpB210Image.src}
            alt="USRP B210"
            className="device-image"
            width={300}
            height={200}
            priority
          />
        </div>
      </div>
      <div className="charts-grid">
        <div className="chart-card">
          <h2>
            <i className="fas fa-bolt"></i> Radar Voltage
          </h2>
          <GaugeChart
            id="radarData-voltage"
            nrOfLevels={100}
            arcsLength={[0.2, 0.3, 0.5]} // Split into segments as needed
            colors={["#00FF00", "#FFBF00", "#FF0000"]} // Green, Yellow, Red
            percent={radarData.voltage / maxVoltage} // Still using a percentage for fill
            formatTextValue={() => `${radarData.voltage?.toFixed(2) || 0} V`} // Show real value as text
            textColor="#000000"
            needleColor="#464A4F"
            needleBaseColor="#464A4F"
            animate={false}
          />
        </div>
        <div className="chart-card">
          <h2>
            <i className="fas fa-wave-square"></i> Radar Current
          </h2>
          <GaugeChart
            id="radarData-current"
            nrOfLevels={100}
            arcsLength={[0.2, 0.4, 0.4]} // Adjust arcs to represent safe, moderate, and high current ranges
            colors={["#00FF00", "#FFBF00", "#FF0000"]} // Green for low, Yellow for mid, Red for high
            percent={
              radarData.current / 5000 > 1 ? 0.95 : radarData.current / 5000
            } // Use the calculated percentage value for the gauge
            formatTextValue={() => `${radarData.current?.toFixed(2) || 0} mA`} // Display the actual current value
            needleColor="#464A4F"
            needleBaseColor="#464A4F"
            textColor="#000000"
            animate={false}
          />
        </div>
        <div className="chart-card">
          <h2>
            <i className="fas fa-plug"></i> Radar Power Consumption
          </h2>
          <GaugeChart
            id="radarData-power"
            nrOfLevels={100}
            arcsLength={[0.3, 0.4, 0.3]} // Adjust arcs for low, medium, and high power consumption
            colors={["#00FF00", "#FFBF00", "#FF0000"]} // Green for low, Yellow for medium, Red for high
            percent={
              radarData.power / 16000 > 1 ? 0.95 : radarData.power / 16000
            } // Use the calculated percentage value for the gauge
            formatTextValue={() => `${radarData.power?.toFixed(2) || 0} mW`} // Display the actual power consumption value
            needleColor="#464A4F"
            needleBaseColor="#464A4F"
            textColor="#000000"
            animate={false}
          />
        </div>
        <div className="chart-card">
          <h2>
            <i className="fas fa-bolt"></i> USRP Voltage
          </h2>
          <GaugeChart
            id="usrpData-voltage"
            nrOfLevels={100}
            arcsLength={[0.2, 0.3, 0.5]} // Split into segments as needed
            colors={["#00FF00", "#FFBF00", "#FF0000"]} // Green, Yellow, Red
            percent={usrpData.voltage / maxVoltage} // Still using a percentage for fill
            formatTextValue={() => `${usrpData.voltage?.toFixed(2) || 0} V`} // Show real value as text
            textColor="#000000"
            needleColor="#464A4F"
            needleBaseColor="#464A4F"
            animate={false}
          />
        </div>
        <div className="chart-card">
          <h2>
            <i className="fas fa-wave-square"></i> USRP Current
          </h2>
          <GaugeChart
            id="usrpData-current"
            nrOfLevels={100}
            arcsLength={[0.2, 0.4, 0.4]} // Adjust arcs to represent safe, moderate, and high current ranges
            colors={["#00FF00", "#FFBF00", "#FF0000"]} // Green for low, Yellow for mid, Red for high
            percent={usrpCurrentPercent} // Use the calculated percentage value for the gauge
            // percent={usrpData.current / maxUsrpCurrent} // Use the calculated percentage value for the gauge
            formatTextValue={() =>
              `${(usrpData.current + usrpCurrentOffset)?.toFixed(2) || 0} mA`
            } // Display the actual current value
            needleColor="#464A4F"
            needleBaseColor="#464A4F"
            textColor="#000000"
            animate={false}
          />
          <div className="button-container">
            <button
              className="control-button"
              onClick={() => adjustCurrent(-10)}
            >
              -10mA
            </button>
            <button
              className="control-button"
              onClick={() => adjustCurrent(10)}
            >
              +10mA
            </button>
          </div>
        </div>
        <div className="chart-card">
          <h2>
            <i className="fas fa-plug"></i> USRP Power Consumption
          </h2>
          <GaugeChart
            id="usrpData-power"
            nrOfLevels={100}
            arcsLength={[0.3, 0.4, 0.3]} // Adjust arcs for low, medium, and high power consumption
            colors={["#00FF00", "#FFBF00", "#FF0000"]} // Green for low, Yellow for medium, Red for high
            percent={usrpPowerPercent} // Use the calculated percentage value for the gauge
            formatTextValue={() => `${usrpData.power?.toFixed(2) || 0} mW`} // Display the actual power consumption value
            needleColor="#464A4F"
            needleBaseColor="#464A4F"
            textColor="#000000"
            animate={false}
          />
        </div>
        <div className="chart-card">
          <h2>
            <i className="fas fa-battery-full"></i> Radar Accumulated Power
          </h2>
          <GaugeChart
            id="radarData-accumulated"
            nrOfLevels={100}
            arcsLength={[0.3, 0.4, 0.3]} // Adjust arcs for low, medium, and high power consumption
            colors={["#00FF00", "#FFBF00", "#FF0000"]} // Green for low, Yellow for medium, Red for high
            percent={radarAccPowerPercent} // Use the calculated percentage value for the gauge
            // percent={radarAccPower / 1000 / maxRadarAccPower} // Use the calculated percentage value for the gauge
            formatTextValue={() =>
              `${(radarData.accumulatedPower / 1000)?.toFixed(2) || 0} W`
            } // Display the actual power consumption value
            needleColor="#464A4F"
            needleBaseColor="#464A4F"
            textColor="#000000"
            animate={false}
          />
        </div>
        <div className="chart-card">
          <h2>
            <i className="fas fa-battery-full"></i> USRP Accumulated Power
          </h2>
          <GaugeChart
            id="usrpData-accumulated"
            nrOfLevels={100}
            arcsLength={[0.3, 0.4, 0.3]} // Adjust arcs for low, medium, and high power consumption
            colors={["#00FF00", "#FFBF00", "#FF0000"]} // Green for low, Yellow for medium, Red for high
            percent={usrpAccPowerPercent} // Use the calculated percentage value for the gauge
            formatTextValue={() =>
              `${(usrpData.accumulatedPower / 1000)?.toFixed(2) || 0} W`
            } // Display the actual power consumption value
            needleColor="#464A4F"
            needleBaseColor="#464A4F"
            textColor="#000000"
            animate={false}
          />
        </div>
        <div className="chart-card">
          <h2>
            <i className="fas fa-plug"></i> Total Power Consumption
          </h2>
          <GaugeChart
            id="total-power"
            nrOfLevels={100}
            arcsLength={[0.3, 0.4, 0.3]} // Adjust arcs for low, medium, and high power consumption
            colors={["#00FF00", "#FFBF00", "#FF0000"]} // Green for low, Yellow for medium, Red for high
            percent={totalAccPowerPercent} // Use the calculated percentage value for the gauge
            formatTextValue={() =>
              `${
                (
                  (radarData.accumulatedPower + usrpData.accumulatedPower) /
                  1000
                )?.toFixed(2) || 0
              } W`
            } // Display the actual power consumption value
            needleColor="#464A4F"
            needleBaseColor="#464A4F"
            textColor="#000000"
            animate={false}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
