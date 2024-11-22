import mysql from "mysql2/promise";

export async function GET(request) {
  try {
    // Establish MySQL connection
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "1111",
      database: "radarDb",
    });

    // Query the latest distance data
    const [rows] = await connection.execute(
      "SELECT dist FROM radartousrp ORDER BY id DESC LIMIT 10"
    );
    connection.end();

    const averageDistance = (
      rows.reduce((sum, row) => sum + row.dist, 0) / rows.length
    ).toFixed(2);
    // Get the most frequent distance value
    const frequencyMap = rows.reduce((acc, row) => {
      acc[row.dist] = (acc[row.dist] || 0) + 1;
      return acc;
    }, {});
    const mostFrequentDistance = parseFloat(Object.entries(frequencyMap).reduce((a, b) =>
      a[1] > b[1] ? a : b
    )[0]).toFixed(2);

    // return new Response(JSON.stringify({ distance: rows[0].dist }), {
    return new Response(
      JSON.stringify({
        distance: rows[0].dist,
        averageDistance,
        mostFrequentDistance,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ distance: 0, error: "Database query failed" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

export async function POST(request) {
  try {
    // Parse request body to get distance
    const body = await request.json();
    const dist = parseFloat(body.distance);

    // Generate random angles
    const azimuth = Math.random() * 90; // 0 to 360 degrees
    const elevation = Math.random() * 90; // -90 to 90 degrees

    // Establish MySQL connection
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "1111",
      database: "radarDb",
    });

    // Insert new data
    const [result] = await connection.execute(
      "INSERT INTO radartousrp (dist, azimuth, elevation) VALUES (?, ?, ?)",
      [dist, azimuth.toFixed(2), elevation.toFixed(2)]
    );

    connection.end();

    return new Response(
      JSON.stringify({
        success: true,
        distance: dist,
        azimuth: azimuth.toFixed(2),
        elevation: elevation.toFixed(2),
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
