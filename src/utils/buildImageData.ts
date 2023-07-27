const createImageData = async (
    ctx: CanvasRenderingContext2D,
    centroids: Uint8ClampedArray[],
    labels: number[],
    width: number,
    height: number
  ) => {
    const newImageData = ctx?.createImageData(width, height);
    if (!newImageData) return;
  
    for (let i = 0; i < labels.length; i++) {
      newImageData.data[i * 4] = centroids[labels[i]][0];
      newImageData.data[i * 4 + 1] = centroids[labels[i]][1];
      newImageData.data[i * 4 + 2] = centroids[labels[i]][2];
      newImageData.data[i * 4 + 3] = 255;
    }
    console.log(newImageData);
    return newImageData;
  };

export default createImageData;