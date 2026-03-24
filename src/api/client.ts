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

export async function moveToLocation(targetLocationId: string) {
  const res = await fetch(`${BASE_URL}/move`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ targetLocationId }),
  });
  return res.json();
}

export async function submitChoice(params: {
  npcId: string;
  choiceId: string;
  gameDate: string;
  gameTime: string;
  npcRole?: string;
  location?: string;
}) {
  const res = await fetch(`${BASE_URL}/choice`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return res.json();
}

export async function switchCharacter(character: "teacher" | "postman") {
  const res = await fetch(`${BASE_URL}/switch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ character }),
  });
  return res.json();
}

export async function fetchBriefing() {
  const res = await fetch(`${BASE_URL}/briefing`);
  return res.json();
}

export async function completeTodo(todoId: number) {
  const res = await fetch(`${BASE_URL}/todo-complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ todoId }),
  });
  return res.json();
}

export async function completeMission(missionId: string) {
  const res = await fetch(`${BASE_URL}/mission-complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ missionId }),
  });
  return res.json();
}
