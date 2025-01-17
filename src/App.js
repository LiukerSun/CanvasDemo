import { useEffect, useRef, useState, useCallback } from 'react';
import { marked } from 'marked';
import './App.css';

function App() {
  const canvasRef = useRef(null);
  const [markdown, setMarkdown] = useState(`# 标题1
## 标题2
这是一个**粗体**文本和*斜体*文本。

- 列表项1
- 列表项2
- 列表项3`);

  const drawText = useCallback((ctx, text, x, y, fontSize = 16, isBold = false, isItalic = false) => {
    ctx.font = `${isItalic ? 'italic ' : ''}${isBold ? 'bold ' : ''}${fontSize}px Arial`;
    ctx.fillText(text, x, y);
    return fontSize + 10;
  }, []);

  const renderMarkdownToCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // 设置画布大小
    canvas.width = 800;
    canvas.height = 600;
    
    // 清空画布
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#282c34';
    
    // 解析Markdown
    const tokens = marked.lexer(markdown);
    
    let currentY = 40;
    const startX = 40;

    tokens.forEach(token => {
      switch (token.type) {
        case 'heading':
          const fontSize = token.depth === 1 ? 32 : 24;
          currentY += drawText(ctx, token.text, startX, currentY, fontSize, true);
          break;
          
        case 'paragraph':
          const lines = token.text.split(/\*\*|\*/).filter(Boolean);
          let x = startX;
          
          lines.forEach((line, index) => {
            const isBold = token.text.includes(`**${line}**`);
            const isItalic = token.text.includes(`*${line}*`);
            const width = ctx.measureText(line).width;
            drawText(ctx, line, x, currentY, 16, isBold, isItalic);
            x += width;
          });
          currentY += 30;
          break;
          
        case 'list':
          token.items.forEach(item => {
            drawText(ctx, `• ${item.text}`, startX, currentY);
            currentY += 25;
          });
          break;
          
        default:
          break;
      }
    });
  }, [markdown, drawText]);

  useEffect(() => {
    renderMarkdownToCanvas();
  }, [renderMarkdownToCanvas]);

  return (
    <div className="App">
      <div style={{ display: 'flex', padding: '20px', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            style={{
              width: '100%',
              height: '400px',
              padding: '10px',
              fontFamily: 'monospace'
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <canvas
            ref={canvasRef}
            style={{
              border: '1px solid #ccc',
              backgroundColor: 'white'
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
