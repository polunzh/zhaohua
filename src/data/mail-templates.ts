export interface MailTemplate {
  id: string;
  type: "letter" | "newspaper" | "package";
  sender: string;
  description: string;
}

export const mailTemplates: MailTemplate[] = [
  {
    id: "family-letter",
    type: "letter",
    sender: "远方的儿子",
    description: "一封从城里寄来的家信",
  },
  { id: "daily-newspaper", type: "newspaper", sender: "报社", description: "今天的报纸" },
  {
    id: "package-clothes",
    type: "package",
    sender: "城里的亲戚",
    description: "一个包裹，里面是几件旧衣服",
  },
  { id: "school-letter", type: "letter", sender: "教育局", description: "教育局的公函" },
  { id: "friend-letter", type: "letter", sender: "老同学", description: "一封老同学的来信" },
];
