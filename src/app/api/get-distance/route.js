import mysql from "mysql2/promise";

export async function GET(request) {
  try {
    // Establish MySQL connection
    const connection = await mysql.createConnection({
      host: "120.126.151.98",
      user: "root",
      password: "1111",
      database: "test",
    });

    // Query the latest distance data
    const [rows] = await connection.execute(
      "SELECT dist FROM radarTOusrp ORDER BY id DESC LIMIT 1"
    );
    connection.end();

    // return new Response(JSON.stringify({ distance: rows[0].dist }), {
    return new Response(JSON.stringify({ distance: rows[0].dist }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ distance: 0,error: "Database query failed" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}

export async function POST(request) {
  try {
    // Parse request body to get distance
    const body = await request.json();
    const dist = parseFloat(body.distance);

    // Generate random angles
    const azimuth = Math.random() * 90;  // 0 to 360 degrees
    const elevation = Math.random() * 90;  // -90 to 90 degrees

    // Establish MySQL connection
    const connection = await mysql.createConnection({
      host: "120.126.151.98",
      user: "root",
      password: "1111",
      database: "test"
    });

    // Insert new data
    const [result] = await connection.execute(
      "INSERT INTO radarTOusrp (dist, azimuth, elevation) VALUES (?, ?, ?)",
      [dist, azimuth.toFixed(2), elevation.toFixed(2)]
    );
    
    connection.end();

    return new Response(
      JSON.stringify({ 
        success: true,
        distance: dist,
        azimuth: azimuth.toFixed(2),
        elevation: elevation.toFixed(2)
      }), 
      {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }), 
      { 
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
}