const https = require('https');
const http = require('http');
const { createCanvas, loadImage } = require('canvas');

const getGridDimensions = (totalPieces) => {
  const gridConfigs = {
    4: { cols: 2, rows: 2 },
    6: { cols: 3, rows: 2 },
    8: { cols: 4, rows: 2 },
    9: { cols: 3, rows: 3 },
    12: { cols: 4, rows: 3 },
    16: { cols: 4, rows: 4 }
  };
  return gridConfigs[totalPieces] || { cols: 4, rows: 4 };
};

const downloadImage = (url) => {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const chunks = [];

    const request = protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/*'
      },
      timeout: 30000
    }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        return downloadImage(redirectUrl).then(resolve).catch(reject);
      }

      if (response.statusCode !== 200) {
        return reject(new Error(`HTTP ${response.statusCode}`));
      }

      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve(buffer);
      });
      response.on('error', reject);
    });

    request.on('error', reject);
    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Timeout'));
    });
  });
};

function createPuzzleTab(ctx, x, y, size, isOut, direction) {
  const tabSize = size * 0.2;
  const depth = isOut ? tabSize : -tabSize;
  
  ctx.save();
  
  switch(direction) {
    case 'top':
      ctx.moveTo(x + size * 0.3, y);
      ctx.bezierCurveTo(
        x + size * 0.3, y - depth * 0.3,
        x + size * 0.35, y - depth * 0.7,
        x + size * 0.4, y - depth
      );
      ctx.bezierCurveTo(
        x + size * 0.45, y - depth * 1.1,
        x + size * 0.55, y - depth * 1.1,
        x + size * 0.6, y - depth
      );
      ctx.bezierCurveTo(
        x + size * 0.65, y - depth * 0.7,
        x + size * 0.7, y - depth * 0.3,
        x + size * 0.7, y
      );
      break;
      
    case 'right':
      ctx.moveTo(x + size, y + size * 0.3);
      ctx.bezierCurveTo(
        x + size + depth * 0.3, y + size * 0.3,
        x + size + depth * 0.7, y + size * 0.35,
        x + size + depth, y + size * 0.4
      );
      ctx.bezierCurveTo(
        x + size + depth * 1.1, y + size * 0.45,
        x + size + depth * 1.1, y + size * 0.55,
        x + size + depth, y + size * 0.6
      );
      ctx.bezierCurveTo(
        x + size + depth * 0.7, y + size * 0.65,
        x + size + depth * 0.3, y + size * 0.7,
        x + size, y + size * 0.7
      );
      break;
      
    case 'bottom':
      ctx.moveTo(x + size * 0.7, y + size);
      ctx.bezierCurveTo(
        x + size * 0.7, y + size + depth * 0.3,
        x + size * 0.65, y + size + depth * 0.7,
        x + size * 0.6, y + size + depth
      );
      ctx.bezierCurveTo(
        x + size * 0.55, y + size + depth * 1.1,
        x + size * 0.45, y + size + depth * 1.1,
        x + size * 0.4, y + size + depth
      );
      ctx.bezierCurveTo(
        x + size * 0.35, y + size + depth * 0.7,
        x + size * 0.3, y + size + depth * 0.3,
        x + size * 0.3, y + size
      );
      break;
      
    case 'left':
      ctx.moveTo(x, y + size * 0.7);
      ctx.bezierCurveTo(
        x - depth * 0.3, y + size * 0.7,
        x - depth * 0.7, y + size * 0.65,
        x - depth, y + size * 0.6
      );
      ctx.bezierCurveTo(
        x - depth * 1.1, y + size * 0.55,
        x - depth * 1.1, y + size * 0.45,
        x - depth, y + size * 0.4
      );
      ctx.bezierCurveTo(
        x - depth * 0.7, y + size * 0.35,
        x - depth * 0.3, y + size * 0.3,
        x, y + size * 0.3
      );
      break;
  }
  
  ctx.restore();
}

function createPuzzlePiecePath(ctx, x, y, width, height, edges) {
  ctx.beginPath();
  
  ctx.moveTo(x, y);
  
  if (edges.top === 'none') {
    ctx.lineTo(x + width * 0.3, y);
  } else {
    ctx.lineTo(x + width * 0.3, y);
    createPuzzleTab(ctx, x, y, width, edges.top === 'out', 'top');
  }
  ctx.lineTo(x + width, y);
  
  if (edges.right === 'none') {
    ctx.lineTo(x + width, y + height * 0.3);
  } else {
    ctx.lineTo(x + width, y + height * 0.3);
    createPuzzleTab(ctx, x, y, width, edges.right === 'out', 'right');
  }
  ctx.lineTo(x + width, y + height);
  
  if (edges.bottom === 'none') {
    ctx.lineTo(x + width * 0.7, y + height);
  } else {
    ctx.lineTo(x + width * 0.7, y + height);
    createPuzzleTab(ctx, x, y, width, edges.bottom === 'out', 'bottom');
  }
  ctx.lineTo(x, y + height);
  
  if (edges.left === 'none') {
    ctx.lineTo(x, y + height * 0.7);
  } else {
    ctx.lineTo(x, y + height * 0.7);
    createPuzzleTab(ctx, x, y, width, edges.left === 'out', 'left');
  }
  ctx.lineTo(x, y);
  
  ctx.closePath();
}

function generateTabPattern(rows, cols) {
  const horizontalEdges = [];
  const verticalEdges = [];
  
  for (let row = 0; row < rows - 1; row++) {
    horizontalEdges[row] = [];
    for (let col = 0; col < cols; col++) {
      horizontalEdges[row][col] = Math.random() > 0.5 ? 'out' : 'in';
    }
  }
  
  for (let row = 0; row < rows; row++) {
    verticalEdges[row] = [];
    for (let col = 0; col < cols - 1; col++) {
      verticalEdges[row][col] = Math.random() > 0.5 ? 'out' : 'in';
    }
  }
  
  const pattern = [];
  for (let row = 0; row < rows; row++) {
    pattern[row] = [];
    for (let col = 0; col < cols; col++) {
      const top = row === 0 ? 'none' : (horizontalEdges[row - 1][col] === 'out' ? 'in' : 'out');
      const bottom = row === rows - 1 ? 'none' : horizontalEdges[row][col];
      const left = col === 0 ? 'none' : (verticalEdges[row][col - 1] === 'out' ? 'in' : 'out');
      const right = col === cols - 1 ? 'none' : verticalEdges[row][col];
      
      pattern[row][col] = { top, right, bottom, left };
    }
  }
  
  return pattern;
}

exports.processPuzzle = async (req, res) => {
  try {
    const { imageUrl, pieces } = req.query;

    if (!imageUrl) {
      return res.status(400).json({ 
        success: false, 
        error: 'URL da imagem não fornecida' 
      });
    }

    if (!pieces || pieces < 4 || pieces > 16) {
      return res.status(400).json({ 
        success: false, 
        error: 'Número de peças inválido (deve ser entre 4 e 16)' 
      });
    }

    const totalPieces = parseInt(pieces);

    console.log('📥 Baixando imagem:', imageUrl);
    const imageBuffer = await downloadImage(imageUrl);

    console.log('🖼️  Carregando imagem no canvas...');
    const img = await loadImage(imageBuffer);
    
    console.log(`✓ Imagem carregada: ${img.width}x${img.height}px`);

    const { cols, rows } = getGridDimensions(totalPieces);
    const pieceWidth = Math.floor(img.width / cols);
    const pieceHeight = Math.floor(img.height / rows);

    console.log(`✂️  Dividindo em ${rows}x${cols} peças com encaixes complementares`);

    const tabPattern = generateTabPattern(rows, cols);

    const tabSize = Math.max(pieceWidth, pieceHeight) * 0.25;
    const canvasWidth = pieceWidth + tabSize * 2;
    const canvasHeight = pieceHeight + tabSize * 2;
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    const piecesData = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const pieceIndex = row * cols + col;

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        
        const edges = tabPattern[row][col];
        
        const offsetX = tabSize;
        const offsetY = tabSize;
        
        ctx.save();
        
        createPuzzlePiecePath(
          ctx, 
          offsetX, 
          offsetY, 
          pieceWidth, 
          pieceHeight, 
          edges
        );
        
        ctx.clip();
        
        const imgOffsetX = col * pieceWidth;
        const imgOffsetY = row * pieceHeight;
        
        ctx.drawImage(
          img,
          imgOffsetX,
          imgOffsetY,
          pieceWidth,
          pieceHeight,
          offsetX,
          offsetY,
          pieceWidth,
          pieceHeight
        );
        
        ctx.restore();
        
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 2;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        
        createPuzzlePiecePath(
          ctx, 
          offsetX, 
          offsetY, 
          pieceWidth, 
          pieceHeight, 
          edges
        );
        ctx.stroke();

        const dataUrl = canvas.toDataURL('image/png', 0.95);

        piecesData.push({
          id: pieceIndex,
          correctPosition: pieceIndex,
          imageData: dataUrl,
          row,
          col,
          edges
        });
      }
    }

    console.log(`✓ ${piecesData.length} peças com encaixes complementares criadas!`);

    res.json({
      success: true,
      pieces: piecesData,
      grid: { cols, rows },
      totalPieces: piecesData.length
    });

  } catch (error) {
    console.error('❌ Erro ao processar puzzle:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao processar quebra-cabeça'
    });
  }
};
