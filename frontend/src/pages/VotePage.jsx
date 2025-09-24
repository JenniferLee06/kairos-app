// frontend/src/pages/VotePage.jsx (真正已更新)

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function VotePage() {
  const { uniqueLink } = useParams();
  const [eventDetails, setEventDetails] = useState(null);
  const [participantName, setParticipantName] = useState('');
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        // ******** 第1处修改！ ********
        const response = await fetch(`https://kairos-backend-w8ku.onrender.com/api/events/${uniqueLink}`);
        if (!response.ok) {
          throw new Error('找不到这个活动，请检查链接是否正确。');
        }
        const data = await response.json();
        setEventDetails(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEventDetails();
  }, [uniqueLink]);

  const handleSlotSelection = (slot) => {
    if (selectedSlots.includes(slot)) {
      setSelectedSlots(selectedSlots.filter(s => s !== slot));
    } else {
      setSelectedSlots([...selectedSlots, slot]);
    }
  };
  
  const handleSubmitVote = async () => {
    if (participantName.trim() === '' || selectedSlots.length === 0) {
      alert('你的名字和至少一个时间段都不能为空哦！');
      return;
    }
    try {
      // ******** 第2处修改！ ********
      const response = await fetch(`https://kairos-backend-w8ku.onrender.com/api/events/${uniqueLink}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantName, selectedSlots }),
      });
      if (!response.ok) {
        throw new Error('提交失败，请稍后再试。');
      }
      setIsSubmitted(true);
    } catch (err) {
      alert(err.message);
    }
  };

  if (isLoading) {
    return <div className="container">正在加载活动信息...</div>;
  }
  if (error) {
    return <div className="container">错误: {error}</div>;
  }
  if (isSubmitted) {
    return (
      <div className="container">
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