function claudeWaveDistortion(imageData) {
    const { data, width, height } = imageData;
    const tempData = new Uint8ClampedArray(data);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const offset = (Math.sin(x * 0.1) * 10) | 0; // Vertical wave
            const srcY = Math.min(Math.max(y + offset, 0), height - 1);
            
            const destIndex = (y * width + x) * 4;
            const srcIndex = (srcY * width + x) * 4;
            
            data[destIndex] = tempData[srcIndex];         // R
            data[destIndex + 1] = tempData[srcIndex + 1]; // G
            data[destIndex + 2] = tempData[srcIndex + 2]; // B
            data[destIndex + 3] = tempData[srcIndex + 3]; // A
        }
    }
}

function defaultWarp(imageData){
    const {data, width, height} = imageData
    const tempData = new Uint8ClampedArray(data);
    let value1 = Math.floor(Math.random()*60)+20
    let value2 = Math.floor(Math.random()*100)+150
    console.log("Warping")
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          let newX = x, newY = y;
          newX = x + Math.sin((y - height/3) / value1) * value2;
          
          const sourceIdx = (Math.floor(newY) * width + Math.floor(newX)) * 4;
          if (sourceIdx >= 0 && sourceIdx < data.length - 3) {
            data[idx] = tempData[sourceIdx];
            data[idx + 1] = tempData[sourceIdx + 1];
            data[idx + 2] = tempData[sourceIdx + 2];
            data[idx + 3] = tempData[sourceIdx + 3];
          }
        }
      }
}

function findBackgroundColor(imageData, mostCommon) {

    const data = imageData.data;
  
    let darkestColor = { r: 255, g: 255, b: 255 }; // Initialize with white
  
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3]; // Alpha channel
  
      // Skip fully transparent pixels
      if (a === 0) {
        continue;
      }
  
      // Skip black pixels
      if (r < 40 && g < 40 && b < 40) {
        continue;
      }
  
      if (mostCommon == "r" && r < 150){
        continue;
      }
  
      if (mostCommon == "g" && g < 150){
        continue;
      }
  
      if (mostCommon == "b" && b < 150){
        continue;
      }
  
  
      const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  
      if (luminance < 0.2126 * darkestColor.r + 0.7152 * darkestColor.g + 0.0722 * darkestColor.b) {
        darkestColor.r = r;
        darkestColor.g = g;
        darkestColor.b = b;
      }
    }
  
    return `rgb(${darkestColor.r}, ${darkestColor.g}, ${darkestColor.b})`;
  }
  
  
  function getMostCommonColorValue(imageData) {
    const data = imageData.data;
    const rValues = [];
    const gValues = [];
    const bValues = [];
    var rTotal = 0;
    var gTotal = 0;
    var bTotal = 0
    // Separate R, G, and B values
    for (let i = 0; i < data.length; i += 4) {
      rValues.push(data[i]);
      rTotal+=data[i]
      gValues.push(data[i + 1]);
      gTotal+=data[i+1]
      bValues.push(data[i + 2]);
      bTotal+=data[i+2]
    }
    const numbers = [rTotal, gTotal, bTotal];
  
    // Sort the array in descending order
    numbers.sort((a, b) => b - a); 
  
    // Return the first two elements (the highest two)
    numbers.slice(0, 2)
    let mc;
    let sc;
    if (numbers[0] == rTotal){
      mc = "r"
    } else if (numbers[0] == gTotal){
      mc = "g"
    } else if (numbers[0] == bTotal){
     mc = "b"
    }
  
    if (numbers[1] == rTotal){
      sc = "r"
    } else if (numbers[1] == gTotal){
      sc = "g"
    } else if (numbers[1] == bTotal){
      sc = "b"
    }
  
    // Find the most frequent value for each channel
    return [mc, sc]
  
  }
  