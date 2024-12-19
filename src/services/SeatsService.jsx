const SEATS_CONFIG = {
  Publicworkspacekey: "57069033-6fc3-4e57-8ebc-c4f54d3d742e",
  Secretworkspacekey: "8cd678c5-d6d5-43f1-b377-255951f6405f",
  eventkey: "e979330a-5c0c-429e-8689-cf54ec6aceff",
};

export const fetchHoldToken = async (secretWorkspaceKey) => {
  const token = btoa(`${secretWorkspaceKey}:`);
  const response = await fetch("https://api-eu.seatsio.net/hold-tokens", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${token}`,
    },
  });

  if (!response.ok) throw new Error("Failed to fetch hold token");

  const data = await response.json();
  return data.holdToken;
};

export const bookSeats = async (
  secretWorkspaceKey,
  eventKey,
  selectedSeats
) => {
  const token = btoa(`${secretWorkspaceKey}:`);
  const response = await fetch(
    `https://api-eu.seatsio.net/events/${eventKey}/actions/book`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${token}`,
      },
      body: JSON.stringify({
        objects: selectedSeats.map((seat) => seat.id),
      }),
    }
  );

  if (!response.ok) throw new Error("Booking failed");
};
