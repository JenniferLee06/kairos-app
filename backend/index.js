// backend/index.js (终版代码)

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const { nanoid } = require('nanoid');

// --- ✍️ 文案中心 (Copywriting Center) ---
const copy = {
  APP_NAME: "Kairos", 
  INTERNAL_SERVER_ERROR: "服务器开小差了，请稍后再试。",
  BACKEND_WELCOME: "欢迎来到 Kairos!", 
  EVENT_CREATION_SUCCESS: "活动创建成功！",
  EVENT_CREATION_FAILED_VALIDATION: "活动标题和候选时间不能为空哦。",
  EVENT_NOT_FOUND: "哎呀，这个活动链接不存在或已失效。",
  VOTE_SUCCESS: "投票成功！感谢你的参与。"
};

const app = express();
const PORT = 4000;
let db;

(async () => {
    db = await open({
        filename: './database.db',
        driver: sqlite3.Database
    });
    console.log('成功连接到 SQLite 数据库.');

    await db.exec(`
        CREATE TABLE IF NOT EXISTS Events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            timeSlots TEXT NOT NULL,
            uniqueLink TEXT NOT NULL UNIQUE
        );
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS Votes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            eventId INTEGER NOT NULL,
            participantName TEXT NOT NULL,
            selectedSlots TEXT NOT NULL,
            FOREIGN KEY (eventId) REFERENCES Events (id)
        );
    `);

    console.log('数据表已成功创建或已存在.');
})();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send(copy.BACKEND_WELCOME);
});

// API 端点：创建一个新的活动
app.post('/api/events', async (req, res) => {
    try {
        const { title, timeSlots } = req.body;
        if (!title || !timeSlots || !Array.isArray(timeSlots) || timeSlots.length === 0) {
            return res.status(400).json({ error: copy.EVENT_CREATION_FAILED_VALIDATION });
        }
        const uniqueLink = nanoid(10);
        const result = await db.run(
            'INSERT INTO Events (title, timeSlots, uniqueLink) VALUES (?, ?, ?)',
            [title, JSON.stringify(timeSlots), uniqueLink]
        );
        res.status(201).json({
            message: copy.EVENT_CREATION_SUCCESS,
            eventId: result.lastID,
            uniqueLink: uniqueLink
        });
    } catch (error) {
        console.error('创建活动时出错:', error);
        res.status(500).json({ error: copy.INTERNAL_SERVER_ERROR });
    }
});

// API 端点：根据 uniqueLink 获取单个活动的详情
app.get('/api/events/:uniqueLink', async (req, res) => {
    try {
        const { uniqueLink } = req.params;
        const event = await db.get('SELECT title, timeSlots FROM Events WHERE uniqueLink = ?', [uniqueLink]);
        if (event) {
            res.json({
                title: event.title,
                timeSlots: JSON.parse(event.timeSlots)
            });
        } else {
            res.status(404).json({ error: copy.EVENT_NOT_FOUND });
        }
    } catch (error) {
        console.error('获取活动时出错:', error);
        res.status(500).json({ error: copy.INTERNAL_SERVER_ERROR });
    }
});

// API 端点：为某个活动提交投票
app.post('/api/events/:uniqueLink/vote', async (req, res) => {
    try {
        const { uniqueLink } = req.params;
        const { participantName, selectedSlots } = req.body;
        const event = await db.get('SELECT id FROM Events WHERE uniqueLink = ?', [uniqueLink]);
        if (!event) {
            return res.status(404).json({ error: copy.EVENT_NOT_FOUND });
        }
        await db.run(
            'INSERT INTO Votes (eventId, participantName, selectedSlots) VALUES (?, ?, ?)',
            [event.id, participantName, JSON.stringify(selectedSlots)]
        );
        res.status(201).json({ message: copy.VOTE_SUCCESS });
    } catch (error) {
        console.error('提交投票时出错:', error);
        res.status(500).json({ error: copy.INTERNAL_SERVER_ERROR });
    }
});


app.listen(PORT, () => {
  console.log(`服务器正在 http://localhost:${PORT} 上成功运行`);
});