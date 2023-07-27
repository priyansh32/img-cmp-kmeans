import KMeans from "@/utils/kmeans";
import { useRef, useState } from "react";

const convertToRGBVector = async (imageData: ImageData) => {
  const rgbData: number[][] = [];
  for (let i = 0; i < imageData.data.length; i += 4) {
    rgbData.push([
      imageData.data[i],
      imageData.data[i + 1],
      imageData.data[i + 2],
      imageData.data[i + 3],
    ]);
  }
  return rgbData;
};

const createImageData = async (
  ctx: CanvasRenderingContext2D,
  centroids: number[][],
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
    newImageData.data[i * 4 + 3] = centroids[labels[i]][3];
  }

  return newImageData;
};

export default function Page() {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsProcessing(true);
    if (!e.target.files) return;

    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const image = new Image();
      image.src = e.target?.result as string;

      image.onload = async () => {
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(image, 0, 0);

        const imageData = ctx?.getImageData(0, 0, image.width, image.height);
        // convert image data to array of arrays of rgb values
        if (!imageData) return;

        const rgbData = await convertToRGBVector(imageData);

        const totalColors = parseInt(colorInput.current?.value as string);
        const kmin = new KMeans(rgbData, totalColors);

        await (async () => {
          kmin.cluster(20);
        })();

        const centroids = kmin.getCentroids();
        const labels = kmin.getClusterAssignments();

        if (!labels || !centroids) return;

        // convert array of arrays of rgb values to image data and download
        const newImageData = await createImageData(
          ctx!,
          centroids,
          labels,
          image.width,
          image.height
        );

        if (!newImageData) return;

        ctx?.putImageData(newImageData, 0, 0);

        const a = document.createElement("a");
        a.href = canvas.toDataURL("image/png");
        a.download = "compressed.png";
        a.click();
        setIsProcessing(false);
      };
    };
    reader.readAsDataURL(file);
  };

  const fileInput = useRef<HTMLInputElement>(null);
  const colorInput = useRef<HTMLInputElement>(null);

  return (
    <div className='h-screen w-full flex flex-col items-center justify-center dark:bg-gray-900'>
      <form className='space-y-8 divide-y divide-gray-200 w-full max-w-lg p-2'>
        <div className='space-y-8 divide-y divide-gray-200'>
          <div>
            <div>
              <h1 className='text-2xl my-4 leading-6 font-medium text-gray-900 dark:text-gray-100'>
                Convert Image to 2-16 bit colors
              </h1>
              <p className='mt-1 text-sm text-gray-500 dark:text-gray-300'>
                This application uses K-Means clustering to identify the most
                dominant colors in an image and then converts the image to use
                only those colors. You can read more about K-Means clustering{" "}
                <a
                  href='https://towardsdatascience.com/understanding-k-means-clustering-in-machine-learning-6a6e67336aa1'
                  target='_blank'
                  rel='noreferrer'
                  className='text-blue-500'
                >
                  here
                </a>
              </p>
            </div>

            <div className='mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6'>
              {/* select total colors */}
              <div className='col-span-6'>
                <label
                  htmlFor='total-colors'
                  className='block text-sm font-medium text-gray-700 dark:text-gray-100'
                >
                  Choose total colors
                </label>
                <div className='mt-1'>
                  <input
                    type='number'
                    name='total-colors'
                    id='total-colors'
                    className='shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md text-gray-700'
                    defaultValue={8}
                    min={2}
                    max={16}
                    ref={colorInput}
                  />
                </div>
              </div>

              <div className='col-span-6'>
                <label
                  htmlFor='puzzle-photo'
                  className='block text-sm font-medium text-gray-700 dark:text-gray-100'
                >
                  Image
                </label>
              </div>
              {!isProcessing ? (
                <div className='col-span-6'>
                  <div className='mt-1 flex justify-center items-center px-6 pt-5 pb-6 bg-white rounded-md min-h-[200px]'>
                    <div
                      className='space-y-1 text-center cursor-pointer'
                      onClick={() => {
                        if (fileInput.current) fileInput.current.click();
                      }}
                    >
                      <svg
                        className='mx-auto h-12 w-12 text-gray-400'
                        stroke='currentColor'
                        fill='none'
                        viewBox='0 0 48 48'
                        aria-hidden='true'
                      >
                        <path
                          d='M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02'
                          strokeWidth={2}
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        />
                      </svg>
                      <div className='flex text-sm text-gray-600'>
                        <label
                          htmlFor='image-upload'
                          className='relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500'
                          onClick={(e) => {
                            e.preventDefault();
                          }}
                        >
                          <span>Upload a file</span>
                        </label>
                        <input
                          id='image-upload'
                          name='image-upload'
                          type='file'
                          accept='image/jpg, image/jpeg, image/png'
                          className='sr-only'
                          onChange={handleFileChange}
                          ref={fileInput}
                        />
                      </div>
                      <p className='text-xs text-gray-500'>PNG or JPG.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className='col-span-6'>
                  <div className='mt-1 flex justify-center items-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md min-h-[200px]'>
                    {/* a div with 50% border radius */}
                    <span className='inline-block h-12 w-12 animate-spin rounded-full border-8 border-gray-200 border-r-blue-500'></span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className='py-5 my-4'>
          <p className='text-sm text-gray-500'>
            Image will be downloaded automatically.
          </p>
          {/* <div className='flex justify-end'>
            <button
              type='submit'
              className='ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              onClick={(e) => {
                e.preventDefault();
                
              }}
            >
              {isProcessing ? "Processing..." : "Compress and Download"}
            </button>
          </div> */}
        </div>
      </form>
    </div>
  );
}
