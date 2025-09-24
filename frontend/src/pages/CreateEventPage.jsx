// frontend/src/App.jsx
import { useState } from 'react';

function CreateEventPage() {
  const [title, setTitle] = useState('');
  const [currentTimeSlot, setCurrentTimeSlot] = useState('');
  const [timeSlots, setTimeSlots] = useState([]);

  // --- 新增的逻辑函数放在这里 ---

  // 函数：处理“添加”按钮点击
  const handleAddTimeSlot = () => {
    // 检查输入框是否为空，如果为空则不执行任何操作
    if (currentTimeSlot.trim() === '') {
      return; 
    }
    // 更新 timeSlots 列表：...timeSlots 表示保留所有旧的时间段
    setTimeSlots([...timeSlots, currentTimeSlot]);
    // 添加后，清空当前输入框，方便用户继续输入
    setCurrentTimeSlot('');
  };

  // 函数：处理“删除”按钮点击
  // 参数 index 代表要删除的是第几个时间段
  const handleRemoveTimeSlot = (indexToRemove) => {
    // 使用 filter 方法创建一个新数组，其中不包含要删除的那个元素
    const updatedTimeSlots = timeSlots.filter((_, index) => index !== indexToRemove);
    setTimeSlots(updatedTimeSlots);
  };

  // 函数：处理“创建活动”按钮点击
  // 这是一个异步函数 (async)，因为它需要等待后端服务器的回应
  const handleCreateEvent = async () => {
    // 简单验证
    if (title.trim() === '' || timeSlots.length === 0) {
      alert('活动标题和候选时间都不能为空哦！');
      return;
    }

    try {
      // 使用 fetch API 向我们的后端发送一个 POST 请求
      const response = await fetch('http://localhost:4000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // 告诉后端我们发送的是 JSON 数据
        },
        // 将我们的数据转换成 JSON 字符串
        body: JSON.stringify({
          title: title,
          timeSlots: timeSlots,
        }),
      });

      // 如果后端没有成功处理（比如返回400或500错误）
      if (!response.ok) {
        throw new Error('网络响应错误');
      }

      // 解析后端返回的 JSON 数据
      const data = await response.json();
      
      // 用一个弹窗显示成功信息和专属链接！
      alert(`${data.message}\n你的专属链接是: ${data.uniqueLink}`);

    } catch (error) {
      console.error('创建活动失败:', error);
      alert('创建活动失败，请检查后端服务器是否正在运行。');
    }
  };


return (
    <div className="container">
      <h1>创建你的 Kairos 活动</h1>

      <div className="input-group">
        <label>活动标题:</label>
        <input 
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例如：团队聚餐"
        />
      </div>

      <div className="input-group">
        <label>添加候选时间:</label>
        <input 
          type="text"
          value={currentTimeSlot}
          onChange={(e) => setCurrentTimeSlot(e.target.value)}
          placeholder="例如：周五晚上7点"
        />
        <button onClick={handleAddTimeSlot}>添加</button>
      </div>

      <div className="timeslot-list">
        <h3>已添加的时间段:</h3>
        <ul>
          {timeSlots.map((slot, index) => (
            <li key={index}>
              <span>{slot}</span>
              <button onClick={() => handleRemoveTimeSlot(index)}>删除</button>
            </li>
          ))}
        </ul>
      </div>

      <button onClick={handleCreateEvent}>创建活动并获取链接</button>
    </div>
  )
}

export default CreateEventPage