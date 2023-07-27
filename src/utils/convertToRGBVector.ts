const convertToRGBVector = async (imageData: ImageData) => {
    const rgbData: Uint8ClampedArray[] = [];
    for (let i = 0; i < imageData.data.length; i += 4) {
      const rgb = [
        imageData.data[i],
        imageData.data[i + 1],
        imageData.data[i + 2],
      ];
      rgbData.push(Uint8ClampedArray.from(rgb));
    }
    return rgbData;
  };
  

export default convertToRGBVector;