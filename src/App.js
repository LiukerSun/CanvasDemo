import { useEffect, useRef, useState, useCallback } from 'react';
import { marked } from 'marked';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import './App.css';
import html2canvas from 'html2canvas';

function App() {
  const canvasRef = useRef(null);
  const [markdown, setMarkdown] = useState(`# 数学公式示例

这是一个行内公式：$E = mc^2$

这是一个单独的公式：
$\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$

普通文本和**粗体**文本。

- 列表项 1
- 公式列表：$F = ma$
- 列表项 3`);

  const drawLatex = useCallback(async (ctx, formula, x, y, fontSize = 16) => {
    try {
      // 创建临时元素
      const tempElement = document.createElement('div');
      tempElement.style.position = 'absolute';
      tempElement.style.left = '-9999px';
      tempElement.style.fontSize = `${fontSize}px`;
      document.body.appendChild(tempElement);

      // 渲染 LaTeX
      katex.render(formula, tempElement, {
        throwOnError: false,
        displayMode: false
      });

      // 转换为 canvas
      const canvas = await html2canvas(tempElement);
      
      // 绘制到主 canvas
      ctx.drawImage(canvas, x, y - fontSize);
      
      // 清理
      document.body.removeChild(tempElement);
      
      return canvas.width;
    } catch (error) {
      console.error('LaTeX 渲染错误:', error);
      ctx.font = `${fontSize}px Arial`;
      ctx.fillText(formula, x, y);
      return ctx.measureText(formula).width;
    }
  }, []);

  const drawText = useCallback((ctx, text, x, y, fontSize = 16, isBold = false, isItalic = false) => {
    ctx.font = `${isItalic ? 'italic ' : ''}${isBold ? 'bold ' : ''}${fontSize}px Arial`;
    ctx.fillText(text, x, y);
    return fontSize + 10;
  }, []);

  const renderMarkdownToCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = 800;
    canvas.height = 600;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#282c34';
    
    const tokens = marked.lexer(markdown);
    
    let currentY = 40;
    const startX = 40;

    for (const token of tokens) {
      switch (token.type) {
        case 'heading':
          const fontSize = token.depth === 1 ? 32 : 24;
          currentY += drawText(ctx, token.text, startX, currentY, fontSize, true);
          break;
          
        case 'paragraph':
          const segments = token.text.split(/(\$[^$]+\$)/);
          let x = startX;
          
          for (const segment of segments) {
            if (segment.startsWith('$') && segment.endsWith('$')) {
              const formula = segment.slice(1, -1);
              const width = await drawLatex(ctx, formula, x, currentY, 16);
              x += width + 10;
            } else {
              const lines = segment.split(/\*\*|\*/).filter(Boolean);
              for (const line of lines) {
                const isBold = token.text.includes(`**${line}**`);
                const isItalic = token.text.includes(`*${line}*`);
                const width = ctx.measureText(line).width;
                drawText(ctx, line, x, currentY, 16, isBold, isItalic);
                x += width;
              }
            }
          }
          currentY += 30;
          break;
          
        case 'list':
          for (const item of token.items) {
            const segments = item.text.split(/(\$[^$]+\$)/);
            let x = startX;
            drawText(ctx, '• ', x, currentY);
            x += ctx.measureText('• ').width;
            
            for (const segment of segments) {
              if (segment.startsWith('$') && segment.endsWith('$')) {
                const formula = segment.slice(1, -1);
                const width = await drawLatex(ctx, formula, x, currentY, 16);
                x += width + 10;
              } else {
                const width = ctx.measureText(segment).width;
                drawText(ctx, segment, x, currentY);
                x += width;
              }
            }
            currentY += 25;
          }
          break;
          
        default:
          break;
      }
    }
  }, [markdown, drawText, drawLatex]);

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
