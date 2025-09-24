// frontend/src/pages/VotePage.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // 1. 导入 useParams

function VotePage() {
  // 从 URL 中获取 uniqueLink
  const { uniqueLink } = useParams();

  // 创建一堆“记忆盒子”来存放这个页面需要的数据
  const [eventDetails, setEventDetails] = useState(null); // 存放活动详情
  const [participantName, setParticipantName] = useState(''); // 存放参与者名字
  const [selectedSlots, setSelectedSlots] = useState([]); // 存放用户勾选的时间
  const [isLoading, setIsLoading] = useState(true); // 是否正在加载数据
  const [error, setError] = useState(null); // 存放错误信息
  const [isSubmitted, setIsSubmitted] = useState(false); // 是否已成功提交

  // 2. 使用 useEffect 在页面加载时获取数据
  useEffect(() => {
    // 定义一个异步函数来获取数据
    const fetchEventDetails = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/events/${uniqueLink}`);
        if (!response.ok) {
          throw new Error('找不到这个活动，请检查链接是否正确。');
        }
        const data = await response.json();
        setEventDetails(data); // 将获取到的数据存入记忆盒子
      } catch (err) {
        setError(err.message); // 如果出错，将错误信息存入记忆盒子
      } finally {
        setIsLoading(false); // 无论成功失败，最后都结束加载状态
      }
    };

    fetchEventDetails();
  }, [uniqueLink]); // 依赖数组中的 uniqueLink 表示当链接变化时，重新获取数据

  // 函数：处理时间段的勾选/取消勾选
  const handleSlotSelection = (slot) => {
    // 检查这个slot是否已经被选了
    if (selectedSlots.includes(slot)) {
      // 如果已选，就把它从列表里移除
      setSelectedSlots(selectedSlots.filter(s => s !== slot));
    } else {
      // 如果未选，就把它加入列表
      setSelectedSlots([...selectedSlots, slot]);
    }
  };
  
  // 函数：处理最终的投票提交
  const handleSubmitVote = async () => {
    if (participantName.trim() === '' || selectedSlots.length === 0) {
      alert('你的名字和至少一个时间段都不能为空哦！');
      return;
    }
    try {
      const response = await fetch(`http://localhost:4000/api/events/${uniqueLink}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantName, selectedSlots }),
      });
      if (!response.ok) {
        throw new Error('提交失败，请稍后再试。');
      }
      setIsSubmitted(true); // 提交成功，更新状态
    } catch (err) {
      alert(err.message);
    }
  };

  // --- 根据不同状态显示不同内容 ---
  if (isLoading) {
    return <div>正在加载活动信息...</div>;
  }
  if (error) {
    return <div>错误: {error}</div>;
  }
  if (isSubmitted) {
    return (
      <div>
        <h1>感谢你的参与！</h1>
        <p>你的时间安排已成功提交。</p>
      </div>
    );
  }

return (
    <div className="container">
      <h1>{eventDetails.title}</h1>
      <p>请填写你的名字，并选择你有空的时间段：</p>

      <div className="input-group">
        <label>你的名字:</label>
        <input 
          type="text"
          value={participantName}
          onChange={(e) => setParticipantName(e.target.value)}
          placeholder="请输入你的名字或昵称"
        />
      </div>

      <div className="input-group">
        <h3>候选时间:</h3>
        {eventDetails.timeSlots.map((slot, index) => (
          <div className="checkbox-group" key={index}>
            <input 
              type="checkbox"
              id={`slot-${index}`}
              value={slot}
              onChange={() => handleSlotSelection(slot)}
            />
            <label htmlFor={`slot-${index}`}>{slot}</label>
          </div>
        ))}
      </div>

      <button onClick={handleSubmitVote}>提交我的时间</button>
    </div>
  );
}

export default VotePage;