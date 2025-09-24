// backend/index.js (升级到 PostgreSQL 的版本)

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); // 导入 pg 的 Pool
const { nanoid } = require('nanoid');

// --- ✍️ 文案中心 (保持不变) ---
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
// 让服务器使用 Render 提供的端口，或者在本地开发时使用 4000
const PORT = process.env.PORT || 4000;

// 创建一个 PostgreSQL 连接池
// 它会自动使用 Render 注入的 DATABASE_URL 环境变量
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  // 如果是部署在 Render 上，需要开启 SSL
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// 数据库初始化函数
const initializeDb = async () => {
  try {
    // SQL 语法从 SQLite 改为 PostgreSQL
    await db.query(`
        CREATE TABLE IF NOT EXISTS Events (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            timeSlots TEXT NOT NULL,
            uniqueLink TEXT NOT NULL UNIQUE
        );
    `);
    await db.query(`
        CREATE TABLE IF NOT EXISTS Votes (
            id SERIAL PRIMARY KEY,
            eventId INTEGER NOT NULL,
            participantName TEXT NOT NULL,
            selectedSlots TEXT NOT NULL,
            FOREIGN KEY (eventId) REFERENCES Events (id)
        );
    `);
    console.log('数据表已成功创建或已存在.');
  } catch (err) {
    console.error('初始化数据库时出错:', err);
  }
};

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
        
        // 查询语句从 db.run 改为 db.query
        const result = await db.query(
            'INSERT INTO Events (title, timeSlots, uniqueLink) VALUES ($1, $2, $3) RETURNING id',
            [title, JSON.stringify(timeSlots), uniqueLink]
        );
        
        res.status(201).json({
            message: copy.EVENT_CREATION_SUCCESS,
            eventId: result.rows[0].id,
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
        // 查询语句从 db.get 改为 db.query
        const result = await db.query('SELECT title, timeSlots FROM Events WHERE uniqueLink = $1', [uniqueLink]);
        const event = result.rows[0];
        
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
        
        const eventResult = await db.query('SELECT id FROM Events WHERE uniqueLink = $1', [uniqueLink]);
        const event = eventResult.rows[0];

        if (!event) {
            return res.status(404).json({ error: copy.EVENT_NOT_FOUND });
        }
        
        await db.query(
            'INSERT INTO Votes (eventId, participantName, selectedSlots) VALUES ($1, $2, $3)',
            [event.id, participantName, JSON.stringify(selectedSlots)]
        );
        
        res.status(201).json({ message: copy.VOTE_SUCCESS });
    } catch (error) {
        console.error('提交投票时出错:', error);
        res.status(500).json({ error: copy.INTERNAL_SERVER_ERROR });
    }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器正在 http://localhost:${PORT} 上成功运行`);
  initializeDb(); // 启动时初始化数据库
});