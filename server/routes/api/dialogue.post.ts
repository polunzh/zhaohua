import { handleDialogue } from "../../handlers/dialogue.post";

export default eventHandler(async (event) => {
  const body = await readBody(event);
  return handleDialogue(body);
});
