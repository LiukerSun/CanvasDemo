import { useEffect, useRef } from 'react';
import './App.css';

function App() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // 设置画布大小
    canvas.width = 500;
    canvas.height = 200;
    
    // 设置文本样式
    ctx.font = '24px Arial';
    ctx.fillStyle = '#282c34';
    
    // 绘制文本
    const text = '这是使用 Canvas 渲染的文本';
    const x = canvas.width / 2;
    const y = canvas.height / 2;
    
    // 文本居中对齐
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 绘制文本
    ctx.fillText(text, x, y);
    
    // 绘制第二行文本
    ctx.font = '18px Arial';
    ctx.fillText('爬虫无法直接读取这段文字', x, y + 30);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <canvas 
          ref={canvasRef}
          style={{
            border: '1px solid #ccc',
            backgroundColor: 'white'
          }}
        />
        
        <p style={{ fontSize: '14px', marginTop: '20px' }}>
          这是一个使用 Canvas 渲染文本的示例
        </p>
      </header>
    </div>
  );
}

export default App;
