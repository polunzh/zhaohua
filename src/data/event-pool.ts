export interface EventTemplate {
  id: string;
  type: "daily" | "seasonal";
  triggerDate?: string;
  seasons?: string[];
  periods?: string[];
  weather?: string[];
  location?: string;
  character?: string;
  minAffinity?: number;
  maxAffinity?: number;
  description: string;
  relationshipTag?: string;
}

export const eventPool: EventTemplate[] = [
  // ===== Seasonal events =====
  {
    id: "school-start",
    type: "seasonal",
    triggerDate: "09-01",
    description: "开学第一天，学生们背着新书包来到学校",
  },
  {
    id: "midterm-exam",
    type: "seasonal",
    triggerDate: "10-20",
    description: "期中考试，教室里安安静静",
  },
  {
    id: "winter-stove",
    type: "seasonal",
    triggerDate: "11-15",
    description: "教室里生起了煤炉，第一次点火总是冒烟",
  },
  {
    id: "new-year-prep",
    type: "seasonal",
    triggerDate: "12-25",
    description: "快过年了，学生们开始写寒假作业清单",
  },
  {
    id: "spring-term",
    type: "seasonal",
    triggerDate: "02-20",
    description: "春季开学，有些学生晒黑了，有些长高了",
  },
  {
    id: "final-exam",
    type: "seasonal",
    triggerDate: "06-25",
    description: "期末考试，天热得坐不住",
  },

  // ===== School spring events =====
  {
    id: "spring-outing-prep",
    type: "daily",
    periods: ["morning"],
    seasons: ["spring"],
    description: "春游准备，学生们叽叽喳喳讨论要带什么吃的",
  },
  {
    id: "rapeseed-observation",
    type: "daily",
    periods: ["morning", "afternoon"],
    seasons: ["spring"],
    location: "farmland",
    description: "带学生去看油菜花，金灿灿的一大片，有人偷偷摘了一朵",
  },
  {
    id: "spring-sports-meet",
    type: "seasonal",
    triggerDate: "04-10",
    description: "春季运动会，操场上红旗招展，学生们拼命给同学加油",
  },
  {
    id: "first-lesson-spring",
    type: "seasonal",
    triggerDate: "02-21",
    description: "开学第一课，讲新学期的规矩，学生们还没收心",
  },
  {
    id: "tree-planting-day",
    type: "seasonal",
    triggerDate: "03-12",
    description: "植树节，全校师生在操场边挖坑种树，泥巴糊了一身",
  },

  // ===== School summer events =====
  {
    id: "summer-cleanup",
    type: "daily",
    periods: ["afternoon"],
    seasons: ["summer"],
    description: "暑假前大扫除，学生们搬桌子擦窗户，教室里灰尘飞扬",
  },
  {
    id: "cicada-singing",
    type: "daily",
    periods: ["morning", "afternoon"],
    seasons: ["summer"],
    description: "知了叫个不停，上课都听不清老师说什么",
  },
  {
    id: "eating-popsicle",
    type: "daily",
    periods: ["afternoon"],
    seasons: ["summer"],
    description: "有人在校门口卖冰棍，五分钱一根，学生们馋得不行",
  },
  {
    id: "classroom-too-hot",
    type: "daily",
    periods: ["afternoon"],
    seasons: ["summer"],
    description: "教室太热了，学生们用课本扇风，谁也坐不住",
  },
  {
    id: "summer-flower-pool",
    type: "daily",
    periods: ["morning", "afternoon"],
    seasons: ["summer"],
    location: "flower-pool",
    description: "花池里的美人蕉开了，红得耀眼，蜜蜂嗡嗡飞",
  },

  // ===== School autumn events =====
  {
    id: "corn-harvest-leave",
    type: "daily",
    periods: ["morning"],
    seasons: ["autumn"],
    description: "又有学生请假回家收玉米，一走就是好几个",
  },
  {
    id: "autumn-parent-meeting",
    type: "seasonal",
    triggerDate: "10-15",
    description: "秋季家长会，有的家长从地里赶来，裤腿上还沾着泥",
  },
  {
    id: "blackboard-contest",
    type: "daily",
    periods: ["afternoon"],
    seasons: ["autumn"],
    description: "黑板报评比，各班使出浑身解数画画写字",
  },
  {
    id: "seat-rearrange",
    type: "daily",
    periods: ["morning"],
    seasons: ["autumn"],
    description: "教室换座位，几个学生争着要坐后排",
  },
  {
    id: "autumn-leaves",
    type: "daily",
    periods: ["morning", "afternoon"],
    seasons: ["autumn"],
    location: "playground",
    description: "操场上落叶厚厚一层，踩上去沙沙响",
  },

  // ===== School winter events =====
  {
    id: "stove-out",
    type: "daily",
    periods: ["morning"],
    seasons: ["winter"],
    description: "煤炉灭了，教室里冷得直哆嗦，值日生赶紧重新生火",
  },
  {
    id: "chilblain",
    type: "daily",
    periods: ["morning", "afternoon"],
    seasons: ["winter"],
    description: "好几个学生手上长了冻疮，又红又肿，写字都疼",
  },
  {
    id: "snowball-fight",
    type: "daily",
    periods: ["morning", "afternoon"],
    seasons: ["winter"],
    weather: ["snowy"],
    location: "playground",
    description: "下雪了，课间学生们在操场上打雪仗，笑声传遍整个学校",
  },
  {
    id: "write-couplets",
    type: "daily",
    periods: ["afternoon"],
    seasons: ["winter"],
    description: "教学生写春联，红纸铺满了课桌，墨汁香飘满教室",
  },
  {
    id: "winter-homework",
    type: "seasonal",
    triggerDate: "01-10",
    description: "发寒假作业，厚厚一本，学生们翻了翻直叹气",
  },

  // ===== Village events =====
  {
    id: "market-day",
    type: "daily",
    periods: ["morning", "afternoon"],
    location: "market",
    description: "赶集日，集市上热热闹闹，有卖年画的、卖鞭炮的、卖糖葫芦的",
  },
  {
    id: "village-wedding",
    type: "daily",
    periods: ["morning", "afternoon"],
    location: "village-road",
    description: "村里办喜事，鞭炮响了一早上，路过能闻到酒席的香味",
  },
  {
    id: "villager-sick",
    type: "daily",
    periods: ["morning", "afternoon"],
    location: "villager-house",
    description: "村里有人生了病，卫生所的赤脚医生骑车去看",
  },
  {
    id: "help-harvest",
    type: "daily",
    periods: ["afternoon"],
    seasons: ["autumn"],
    location: "farmland",
    description: "放学后帮村民收割，弯腰割麦子，腰酸得直不起来",
  },
  {
    id: "pig-slaughter",
    type: "daily",
    periods: ["morning"],
    seasons: ["winter"],
    location: "village-road",
    description: "杀年猪，半个村子的人都来帮忙，孩子们又怕又兴奋地围着看",
  },

  // ===== Affinity-gated events =====
  {
    id: "student-confide",
    type: "daily",
    periods: ["afternoon", "evening"],
    minAffinity: 70,
    description: "有个学生红着眼圈来找你，吞吞吐吐说了家里的难处",
  },
  {
    id: "student-gift",
    type: "daily",
    periods: ["morning"],
    minAffinity: 80,
    description: "学生偷偷在讲台上放了个小礼物——一个叠得歪歪扭扭的纸鹤",
  },
  {
    id: "student-skip",
    type: "daily",
    periods: ["morning", "afternoon"],
    maxAffinity: 30,
    description: "发现有学生逃学了，跑去河边摸鱼",
  },
  {
    id: "friends-play-together",
    type: "daily",
    description: "好朋友们凑在一起，有说有笑",
    periods: ["morning", "afternoon"],
    location: "playground",
    relationshipTag: "friend-activity",
  },
  {
    id: "friend-shares-secret",
    type: "daily",
    description: "有个学生悄悄拉住你，想跟你说个秘密",
    periods: ["morning", "afternoon"],
    location: "classroom",
    relationshipTag: "secret-share",
    minAffinity: 70,
  },

  // ===== Original daily events =====
  {
    id: "student-late",
    type: "daily",
    periods: ["morning"],
    description: "有学生迟到了，气喘吁吁跑进教室",
  },
  {
    id: "homework-missing",
    type: "daily",
    periods: ["morning"],
    description: "收作业时发现有人没写完",
  },
  {
    id: "morning-reading",
    type: "daily",
    periods: ["morning"],
    description: "早读时间，教室里书声琅琅",
  },
  {
    id: "student-fight",
    type: "daily",
    periods: ["afternoon"],
    description: "课间两个学生吵起来了",
    relationshipTag: "rival-conflict",
  },
  {
    id: "parent-visit",
    type: "daily",
    periods: ["afternoon"],
    description: "有家长来学校找老师问孩子的情况",
  },
  {
    id: "nap-in-class",
    type: "daily",
    periods: ["afternoon"],
    description: "下午第一节课，有学生趴在桌上打瞌睡",
  },
  {
    id: "grading-papers",
    type: "daily",
    periods: ["evening"],
    description: "在办公室批改作业，窗外天渐渐黑了",
  },
  {
    id: "colleague-chat",
    type: "daily",
    periods: ["evening"],
    description: "和同事聊了几句明天的课",
  },
  {
    id: "flower-pool-chat",
    type: "daily",
    periods: ["morning", "afternoon"],
    location: "flower-pool",
    description: "在花池边和学生闲聊，月季花开得正好",
  },
  {
    id: "water-tower-queue",
    type: "daily",
    periods: ["morning", "afternoon"],
    location: "water-tower",
    seasons: ["summer"],
    description: "水塔前排起了长队，学生们边等边打闹",
  },
  {
    id: "playground-flag",
    type: "daily",
    periods: ["morning"],
    location: "playground",
    description: "升旗仪式，全校学生站得整整齐齐",
  },
  {
    id: "office-prep",
    type: "daily",
    periods: ["evening"],
    location: "office",
    description: "在办公室备课，翻着教案想明天怎么讲",
  },
  {
    id: "village-road-walk",
    type: "daily",
    periods: ["morning", "afternoon"],
    location: "village-road",
    description: "走在村路上，远处有人在田里干活",
  },
  {
    id: "market-browse",
    type: "daily",
    periods: ["afternoon"],
    location: "market",
    description: "集市上人来人往，有卖菜的有卖布的",
  },

  // ===== Additional daily events =====
  {
    id: "chalk-break",
    type: "daily",
    periods: ["morning", "afternoon"],
    description: "粉笔写着写着断了，又从粉笔盒里拿一根",
  },
  {
    id: "window-broken",
    type: "daily",
    periods: ["afternoon"],
    description: "教室窗户玻璃被球砸碎了，得赶紧找人修",
  },
  {
    id: "rainy-recess",
    type: "daily",
    periods: ["morning", "afternoon"],
    weather: ["rainy"],
    description: "下雨了，课间学生们只能挤在走廊里玩",
  },
  {
    id: "student-poem",
    type: "daily",
    periods: ["morning"],
    description: "有个学生在作文里写了首小诗，虽然稚嫩但真挚得很",
  },
  {
    id: "bell-ring",
    type: "daily",
    periods: ["morning", "afternoon"],
    description: "上课铃响了，看门老头使劲敲着挂在树上的铁块",
  },

  // ===== Postman events =====
  {
    id: "flat-tire",
    type: "daily",
    periods: ["morning", "afternoon"],
    character: "postman",
    description: "自行车扎了胎，只能推着走一段",
  },
  {
    id: "dog-chase",
    type: "daily",
    periods: ["morning", "afternoon"],
    character: "postman",
    location: "village-road",
    description: "村口的大黄狗又追着自行车跑",
  },
  {
    id: "rain-on-route",
    type: "daily",
    periods: ["morning", "afternoon"],
    character: "postman",
    weather: ["rainy"],
    description: "送信半路下起了雨，赶紧把邮包裹好",
  },
  {
    id: "recipient-away",
    type: "daily",
    periods: ["morning", "afternoon"],
    character: "postman",
    location: "villager-house",
    description: "敲了半天门没人开，收件人下地干活去了",
  },
  {
    id: "wrong-address",
    type: "daily",
    periods: ["morning"],
    character: "postman",
    location: "post-office",
    description: "有封信地址写错了，得想办法找到收件人",
  },
  {
    id: "shortcut-field",
    type: "daily",
    periods: ["morning", "afternoon"],
    character: "postman",
    location: "farmland",
    description: "抄近路穿过麦田，鞋上沾满了泥",
  },
  {
    id: "rest-at-shop",
    type: "daily",
    periods: ["afternoon"],
    character: "postman",
    location: "market",
    description: "在马叔的小卖部歇歇脚，喝碗水",
  },
  {
    id: "heavy-package",
    type: "daily",
    periods: ["morning"],
    character: "postman",
    location: "post-office",
    description: "今天有个大包裹，绑在车后座都怕掉",
  },
  {
    id: "newspaper-chat",
    type: "daily",
    periods: ["morning", "afternoon"],
    character: "postman",
    location: "villager-house",
    description: "送报纸时和村民聊了几句庄稼的事",
  },
  {
    id: "snow-route",
    type: "daily",
    periods: ["morning", "afternoon"],
    character: "postman",
    weather: ["snowy"],
    description: "雪天路滑，骑车得格外小心",
  },

  // ===== Cross-character events =====
  {
    id: "postman-at-school",
    type: "daily",
    periods: ["morning"],
    location: "playground",
    description: "邮递员骑车来到学校，带来了今天的信件和报纸",
  },
  {
    id: "teacher-sends-letter",
    type: "daily",
    periods: ["afternoon"],
    location: "playground",
    description: "老师托邮递员帮忙寄一封信",
  },

  // === Evening events (17:00-21:00) ===
  {
    id: "evening-grading",
    type: "daily",
    periods: ["evening"],
    location: "office",
    character: "teacher",
    description: "在办公室批改作业，窗外天渐渐暗了",
  },
  {
    id: "evening-prep",
    type: "daily",
    periods: ["evening"],
    location: "office",
    character: "teacher",
    description: "翻着教案备明天的课，想想怎么讲才好懂",
  },
  {
    id: "evening-colleague-chat",
    type: "daily",
    periods: ["evening"],
    location: "office",
    description: "和同事聊了几句家常",
  },
  {
    id: "evening-walk-home",
    type: "daily",
    periods: ["evening"],
    location: "village-road",
    description: "走在回家的路上，远处炊烟升起",
  },
  {
    id: "evening-sunset",
    type: "daily",
    periods: ["evening"],
    location: "playground",
    description: "夕阳把操场染成了金色",
  },
  {
    id: "evening-stove-check",
    type: "daily",
    periods: ["evening"],
    seasons: ["winter"],
    location: "classroom",
    description: "放学后检查煤炉有没有熄灭，冬天最怕走火",
  },

  // === Night events (21:00-6:00) ===
  {
    id: "night-reading",
    type: "daily",
    periods: ["night"],
    description: "在灯下看了会儿书，夜很安静",
  },
  {
    id: "night-writing",
    type: "daily",
    periods: ["night"],
    description: "在本子上写了几行日记，记录今天的事",
  },
  {
    id: "night-thinking",
    type: "daily",
    periods: ["night"],
    description: "躺在床上想着明天的事，慢慢睡着了",
  },
  {
    id: "night-cricket",
    type: "daily",
    periods: ["night"],
    seasons: ["summer", "autumn"],
    description: "窗外蛐蛐叫得正欢，夏夜难眠",
  },
  {
    id: "night-wind",
    type: "daily",
    periods: ["night"],
    seasons: ["winter"],
    description: "北风呼呼地吹，裹紧被子",
  },
  {
    id: "night-stars",
    type: "daily",
    periods: ["night"],
    location: "village-road",
    description: "抬头看看星星，农村的夜空格外清",
  },
  {
    id: "night-dog-bark",
    type: "daily",
    periods: ["night"],
    location: "village-road",
    description: "远处传来几声狗叫，村子安安静静",
  },

  // === Festivals & Special Days ===
  {
    id: "national-day",
    type: "seasonal",
    triggerDate: "10-01",
    description: "国庆节，学校放假了，操场上挂着红旗。",
  },
  {
    id: "mid-autumn",
    type: "seasonal",
    triggerDate: "08-15",
    description: "中秋节快到了，有人送来了月饼。",
  },
  {
    id: "spring-festival-prep",
    type: "seasonal",
    triggerDate: "01-20",
    description: "快过年了，学生们在写春联，空气里有年味了。",
  },
  {
    id: "lantern-festival",
    type: "seasonal",
    triggerDate: "02-15",
    description: "元宵节，村里有人在扎灯笼。",
  },
  {
    id: "childrens-day",
    type: "seasonal",
    triggerDate: "06-01",
    description: "六一儿童节，学校组织了联欢会，学生们特别开心。",
  },
  {
    id: "teachers-day",
    type: "seasonal",
    triggerDate: "09-10",
    description: "教师节，学生们送来了自制的贺卡，上面写满了歪歪扭扭的祝福。",
  },
  {
    id: "tree-planting",
    type: "seasonal",
    triggerDate: "03-12",
    description: "植树节，全校师生到山坡上种了几棵树。",
  },
  {
    id: "qingming",
    type: "seasonal",
    triggerDate: "04-05",
    description: "清明节前后，雨水多了起来，田里的麦子绿油油的。",
  },
  {
    id: "labor-day",
    type: "seasonal",
    triggerDate: "05-01",
    description: "五一劳动节，放了一天假。",
  },
  {
    id: "dragon-boat",
    type: "seasonal",
    triggerDate: "06-15",
    description: "端午节，有人送来了粽子，糯米的香味飘满教室。",
  },
];
