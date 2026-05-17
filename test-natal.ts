export async function testNatal() {
  const payload = {
    birth_data: {
      name: "paul webster",
      date: "1989-01-06",
      time: "15:10",
      latitude: 35.9969,
      longitude: -78.899,
      city: "string",
      tz_offset: -5
    },
    house_system: "whole_sign",
    anonymous: true,
    persist: false
  };

  const r = await fetch("https://raw-charts.dubtown-server.us/api/v1/natal/full", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  console.log("Status:", r.status);
  console.log("Response:", await r.text());
}

testNatal().catch(console.error);
