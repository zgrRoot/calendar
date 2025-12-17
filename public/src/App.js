
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Check, Trash2, Leaf, X, GripVertical, Sun, Cloud, Sparkles, Heart, Coffee } from 'lucide-react';

const FreshCalendarAppV3 = () => {
  // --- 状态管理 ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [todos, setTodos] = useState({});
  const [newTodo, setNewTodo] = useState('');
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  const [quote, setQuote] = useState('');

  // --- 元气语录库 ---
  const quotes = [
    "今天也要加油鸭！🌱", "休息也是一种努力 ☕", "保持热爱，奔赴山海 🌊", 
    "好事正在发生 ✨", "按时吃饭，按时开心 🍱", "你比想象中更棒 💪",
    "生活明朗，万物可爱 🌻", "别忘了给心情晒晒太阳 ☀️"
  ];

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, [currentDate]); // 每次换月或者刷新时更新语录

  // --- 辅助功能：农历与节假日 ---
  const getLunarAndHoliday = (date) => {
    const lunarString = new Intl.DateTimeFormat('zh-CN', {
      calendar: 'chinese', day: 'numeric', month: 'numeric'
    }).format(date);
    
    let lunarDay = lunarString.split('/')[1] || lunarString;
    if(lunarDay.includes('月')) lunarDay = lunarDay.split('月')[1];

    const month = date.getMonth() + 1;
    const day = date.getDate();
    const solarKey = `${month}-${day}`;
    
    // 基础固定公历节日
    const solarHolidays = {
      '1-1': '元旦', '2-14': '情人节', '3-8': '妇女节', '3-12': '植树节',
      '4-1': '愚人节', '5-1': '劳动节', '5-4': '青年节', '6-1': '儿童节',
      '7-1': '建党节', '8-1': '建军节', '9-10': '教师节', '10-1': '国庆节', '12-25': '圣诞节'
    };

    let holiday = solarHolidays[solarKey];
    if (lunarDay === '1' || lunarDay === '初一') lunarDay = '初一';
    
    return { lunar: lunarDay, holiday };
  };

  // --- 数据持久化 ---
  useEffect(() => {
    const savedTodos = localStorage.getItem('fresh_calendar_todos_v3');
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
  }, []);

  const saveTodos = (newTodos) => {
    setTodos(newTodos);
    localStorage.setItem('fresh_calendar_todos_v3', JSON.stringify(newTodos));
  };

  const getDateKey = (date) => {
    return date.toISOString().split('T')[0];
  };

  // --- 待办事项逻辑 ---
  const handleAddTodo = () => {
    if (!newTodo.trim() || !selectedDate) return;
    const key = getDateKey(selectedDate);
    const currentTodos = todos[key] || [];
    const newTodoList = [...currentTodos, { id: Date.now(), text: newTodo, completed: false }];
    saveTodos({ ...todos, [key]: newTodoList });
    setNewTodo('');
  };

  const toggleTodo = (todoId) => {
    const key = getDateKey(selectedDate);
    const currentTodos = todos[key].map(t => 
      t.id === todoId ? { ...t, completed: !t.completed } : t
    );
    saveTodos({ ...todos, [key]: currentTodos });
  };

  const deleteTodo = (todoId) => {
    const key = getDateKey(selectedDate);
    const currentTodos = todos[key].filter(t => t.id !== todoId);
    saveTodos({ ...todos, [key]: currentTodos });
  };

  // --- 拖拽逻辑 ---
  const handleDragStart = (e, index) => {
    setDraggedItemIndex(index);
    // 使得拖拽图像稍微透明
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
    setDraggedItemIndex(null);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;

    const key = getDateKey(selectedDate);
    const newTodos = [...(todos[key] || [])];
    
    // 交换位置逻辑
    const itemToMove = newTodos[draggedItemIndex];
    newTodos.splice(draggedItemIndex, 1);
    newTodos.splice(index, 0, itemToMove);

    setDraggedItemIndex(index);
    saveTodos({ ...todos, [key]: newTodos });
  };

  // --- 日历生成 ---
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  const changeMonth = (offset) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    setCurrentDate(newDate);
  };

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  // 计算进度条
  const currentKey = selectedDate ? getDateKey(selectedDate) : null;
  const currentTodos = currentKey ? (todos[currentKey] || []) : [];
  const completedCount = currentTodos.filter(t => t.completed).length;
  const progress = currentTodos.length === 0 ? 0 : (completedCount / currentTodos.length) * 100;

  return (
    <div className="min-h-screen bg-[#F0FDF4] font-sans text-slate-600 flex justify-center items-start p-4 transition-colors duration-500">
      
      {/* 主日历容器 */}
      <div className="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-emerald-100/50 border border-white p-6 relative overflow-hidden">
        
        {/* 可爱装饰 */}
        <div className="absolute top-4 right-4 text-yellow-400 animate-pulse"><Sun size={32} /></div>
        <div className="absolute bottom-10 -left-4 text-sky-200 opacity-50"><Cloud size={64} /></div>

        {/* 头部：年月 */}
        <div className="flex justify-between items-center mb-6 relative z-10 pt-2">
          <button onClick={() => changeMonth(-1)} className="p-3 hover:bg-emerald-50 rounded-full text-emerald-600 transition-all active:scale-95">
            <ChevronLeft size={24} />
          </button>
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold text-slate-700">
              {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
            </h2>
            <div className="flex items-center gap-1 text-xs text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full mt-1">
               <Sparkles size={12} /> 
               <span>{quote}</span>
            </div>
          </div>
          <button onClick={() => changeMonth(1)} className="p-3 hover:bg-emerald-50 rounded-full text-emerald-600 transition-all active:scale-95">
            <ChevronRight size={24} />
          </button>
        </div>

        {/* 星期栏 */}
        <div className="grid grid-cols-7 gap-1 mb-2 relative z-10">
          {weekDays.map((day, i) => {
            const isWeekend = i === 0 || i === 6;
            return (
              <div key={day} className={`text-center text-xs font-bold py-2 ${isWeekend ? 'text-orange-400' : 'text-slate-400'}`}>
                {day}
              </div>
            )
          })}
        </div>

        {/* 日历网格 */}
        <div className="grid grid-cols-7 gap-2 relative z-10 pb-4">
          {getDaysInMonth(currentDate).map((date, index) => {
            if (!date) return <div key={`empty-${index}`} />;
            
            const isToday = getDateKey(date) === getDateKey(new Date());
            const dateKey = getDateKey(date);
            const todoList = todos[dateKey] || [];
            const hasTodos = todoList.length > 0;
            const notDoneCount = todoList.filter(t => !t.completed).length;
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            
            const { lunar, holiday } = getLunarAndHoliday(date);
            
            return (
              <button
                key={index}
                onClick={() => setSelectedDate(date)}
                className={`
                  relative h-14 w-full rounded-2xl flex flex-col items-center justify-center transition-all duration-300 group
                  border border-transparent
                  ${isToday ? 'bg-emerald-100 ring-2 ring-emerald-300 text-emerald-800' : 
                    (isWeekend ? 'bg-orange-50 hover:bg-orange-100' : 'bg-slate-50 hover:bg-emerald-50')}
                  hover:scale-105 hover:shadow-md active:scale-95
                `}
              >
                <span className={`text-sm font-bold z-10 ${isWeekend && !isToday ? 'text-orange-500' : ''}`}>
                    {date.getDate()}
                </span>
                
                <span className={`text-[10px] mt-0 z-10 truncate w-full text-center px-1 scale-90 ${holiday ? 'text-emerald-600 font-bold' : (isWeekend ? 'text-orange-300' : 'text-slate-400')}`}>
                    {holiday || lunar}
                </span>

                {/* 待办红点 */}
                {hasTodos && notDoneCount > 0 && (
                   <div className="absolute top-1 right-1 w-2 h-2 bg-rose-400 rounded-full"></div>
                )}
                {hasTodos && notDoneCount === 0 && (
                   <div className="absolute top-1 right-1 w-2 h-2 bg-emerald-400 rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* --- Modal 浮层 --- */}
      {selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
             className="bg-white w-full max-w-md max-h-[85vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
             onClick={(e) => e.stopPropagation()}
          >
            {/* 头部 */}
            <div className="bg-[#F0FDF4] p-6 shrink-0 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-emerald-600"><Leaf size={120} /></div>
                
                <div className="flex justify-between items-start relative z-10">
                    <div>
                        <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            {selectedDate.getDate()}日
                            {(selectedDate.getDay() === 0 || selectedDate.getDay() === 6) && 
                                <span className="bg-orange-100 text-orange-500 text-xs px-2 py-1 rounded-lg">休息日</span>
                            }
                        </h3>
                        <p className="text-emerald-600 font-medium text-sm mt-1">
                            {getLunarAndHoliday(selectedDate).holiday || getLunarAndHoliday(selectedDate).lunar} · {weekDays[selectedDate.getDay()]}
                        </p>
                    </div>
                    <button 
                        onClick={() => setSelectedDate(null)}
                        className="p-2 bg-white/50 hover:bg-white rounded-full text-slate-400 hover:text-slate-600 transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* 进度条回归 */}
                {currentTodos.length > 0 && (
                    <div className="mt-4 relative z-10">
                        <div className="flex justify-between text-xs text-slate-500 mb-1 font-medium">
                            <span>完成进度</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2.5 w-full bg-emerald-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-500 rounded-full"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* 列表区域 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-white">
                 {currentTodos.length === 0 ? (
                     <div className="h-48 flex flex-col items-center justify-center text-slate-300 gap-3">
                         <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                            <Coffee size={32} className="text-emerald-200" />
                         </div>
                         <p>今天暂无安排，享受当下吧 ~</p>
                     </div>
                 ) : (
                    currentTodos.map((todo, index) => (
                        <div 
                            key={todo.id}
                            draggable="true"
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            className={`
                                group flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 cursor-move
                                ${draggedItemIndex === index ? 'opacity-0' : 'opacity-100'}
                                ${todo.completed 
                                    ? 'bg-slate-50 border-transparent opacity-60' 
                                    : 'bg-white border-emerald-100 hover:border-emerald-300 hover:shadow-sm'}
                            `}
                        >
                            <div className="text-emerald-200 group-hover:text-emerald-400 transition-colors">
                                <GripVertical size={16} />
                            </div>

                            <button
                                onClick={() => toggleTodo(todo.id)}
                                className={`
                                    w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0
                                    ${todo.completed 
                                    ? 'bg-emerald-400 border-emerald-400 text-white' 
                                    : 'border-slate-300 hover:border-emerald-400 text-transparent'}
                                `}
                            >
                                <Check size={12} strokeWidth={3} />
                            </button>
                            
                            <span className={`flex-1 text-sm ${todo.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                                {todo.text}
                            </span>

                            <button 
                                onClick={() => deleteTodo(todo.id)}
                                className="p-2 text-slate-300 hover:text-red-400 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))
                 )}
                 <div className="h-20"></div>
            </div>

            {/* 底部输入 */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur border-t border-slate-50">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newTodo}
                        onChange={(e) => setNewTodo(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
                        placeholder="✨ 添加一个新的小目标..."
                        className="flex-1 bg-slate-50 border border-transparent focus:bg-white focus:border-emerald-200 rounded-xl px-4 py-3 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all text-sm"
                    />
                    <button 
                        onClick={handleAddTodo}
                        disabled={!newTodo.trim()}
                        className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-200 text-white w-12 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200/50 transition-all active:scale-95"
                    >
                        <Plus size={24} />
                    </button>
                </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default FreshCalendarAppV3;
