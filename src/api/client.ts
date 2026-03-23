const BASE_URL = "/api";

export async function fetchWorldState() {
  const res = await fetch(`${BASE_URL}/world`);
  return res.json();
}

export async function skipTime(type: "day" | "week" | "semester") {
  const res = await fetch(`${BASE_URL}/skip`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type }),
  });
  return res.json();
}

export async function generateDialogue(params: {
  npcName: string;
  npcPersonality: string;
  situation: string;
  season: string;
  gameDate: string;
}) {
  const res = await fetch(`${BASE_URL}/dialogue`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return res.json();
}

export async function submitChoice(params: {
  npcId: string;
  choiceId: string;
  gameDate: string;
  gameTime: string;
}) {
  const res = await fetch(`${BASE_URL}/choice`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return res.json();
}
