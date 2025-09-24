// frontend/src/pages/CreateEventPage.jsx (已更新)

import { useState } from 'react';

function CreateEventPage() {
  const [title, setTitle] = useState('');
  const [currentTimeSlot, setCurrentTimeSlot] = useState('');
  const [timeSlots, setTimeSlots] = useState([]);

  const handleAddTimeSlot = () => {
    if (currentTimeSlot.trim() === '') {
      return; 
    }
    setTimeSlots([...timeSlots, currentTimeSlot]);
    setCurrentTimeSlot('');
  };

  const handleRemoveTimeSlot = (indexToRemove) => {
    const updatedTimeSlots = timeSlots.filter((_, index) => index !== indexToRemove);
    setTimeSlots(updatedTimeSlots);
  };

  const handleCreateEvent = async () => {
    if (title.trim() === '' || timeSlots.length === 0) {
      alert('活动标题和候选时间都不能为空哦！');
      return;
    }

    try {
      // ******** 就是这里被修改了！ ********
      const response = await fetch('https://kairos-backend-w8ku.onrender.com/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title,
          timeSlots: timeSlots,
        }),
      });

      if (!response.ok) {
        throw new Error('网络响应错误');
      }

      const data = await response.json();
      
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

export default CreateEventPage;