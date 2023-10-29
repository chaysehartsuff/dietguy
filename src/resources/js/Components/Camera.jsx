import React, { useRef, useEffect, useState } from 'react';

function Camera({ width = '640px', height = '480px', inputName = 'image' }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const componentRef = useRef(null);
    const cameraRef = useRef(null);
    const layoutBeforeRef = useRef(null);
    const layoutAfterRef = useRef(null);

    const [facingMode, setFacingMode] = useState("user");
    const [enabled, setEnabled] = useState(true);
    const [cameraActive, setCameraActive] = useState(false);

    useEffect(() => {
        // Requesting access to the user's camera
        if(cameraActive) {
            accessCamera();
            cameraRef.current.classList.remove('hidden');
        } else {
            cameraRef.current.classList.add('hidden');
        }

        return () => {
        // Cleanup: stop the camera stream when the component is unmounted
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
        };
    }, [facingMode, cameraActive]);

function accessCamera() 
{
    navigator.mediaDevices.getUserMedia({ video: { facingMode } })
        .then(stream => {
            const video = videoRef.current;
            video.srcObject = stream;

            // When the stream is loaded, play the video
            video.onloadedmetadata = () => {
                video.play();
            };
        })
        .catch(err => {
            console.error("Error accessing the camera:", err);
            componentRef.current.classList.add('hidden');
            setEnabled(false);
        });
}

function captureFrame() 
{
    // Create a canvas element
    const canvas = canvasRef.current;
    canvas.classList.remove('hidden');
    layoutBeforeRef.current.classList.add('hidden');
    layoutAfterRef.current.classList.remove('hidden');
    //canvas.width = videoElement.videoWidth;
    //canvas.height = videoElement.videoHeight;
    
    // Draw the current frame from the video onto the canvas
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    // Convert the canvas image to Data URL
    const dataURL = canvas.toDataURL('image/png');
    videoRef.current.classList.add('hidden');

    setInput(dataURL);
}

function resetCamera()
{
    canvasRef.current.classList.add('hidden');
    videoRef.current.classList.remove('hidden');
    layoutBeforeRef.current.classList.remove('hidden');
    layoutAfterRef.current.classList.add('hidden');

    const input = document.getElementById(inputName);
    if(input){
        input.value = null;
    }
}

function toggleCameraActivate()
{
    setCameraActive(!cameraActive);
}

function setInput(dataURL)
{
    if(enabled){

        const input = document.getElementById(inputName);
        if(input){
            input.value = dataURL;
        }
    }
}

  return (
    <div ref={componentRef} 
        className="w-full bg-gray-100 overflow-hidden">
            <button onClick={toggleCameraActivate}>Activate Camera</button>

         <div ref={cameraRef} className="flex flex-col items-center justify-center hidden shadow-lg fixed top-0 left-0 h-screen w-screen bg-gray-800 p-5">
            <video ref={videoRef} width={width} height={height} autoPlay playsInline muted class="shadow-lg rounded-lg" />
            <canvas ref={canvasRef} width={width} height={height} class="max-w-full max-h-full hidden"></canvas>
            <div class="absolute top-5 right-5">
            <svg onClick={toggleCameraActivate} fill="white" width="50px" height="50px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.587 16.001l6.096 6.096c0.396 0.396 0.396 1.039 0 1.435l-2.151 2.151c-0.396 0.396-1.038 0.396-1.435 0l-6.097-6.096-6.097 6.096c-0.396 0.396-1.038 0.396-1.434 0l-2.152-2.151c-0.396-0.396-0.396-1.038 0-1.435l6.097-6.096-6.097-6.097c-0.396-0.396-0.396-1.039 0-1.435l2.153-2.151c0.396-0.396 1.038-0.396 1.434 0l6.096 6.097 6.097-6.097c0.396-0.396 1.038-0.396 1.435 0l2.151 2.152c0.396 0.396 0.396 1.038 0 1.435l-6.096 6.096z"></path>
            </svg>
            </div>
            <div ref={layoutBeforeRef} class="w-full flex justify-around">
                <div>
                    <svg onClick={captureFrame}
                    class="mx-auto" width="50px" height="50px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="13" r="3" stroke="white" stroke-width="1.5"/>
                        <path d="M2 13.3636C2 10.2994 2 8.76721 2.74902 7.6666C3.07328 7.19014 3.48995 6.78104 3.97524 6.46268C4.69555 5.99013 5.59733 5.82123 6.978 5.76086C7.63685 5.76086 8.20412 5.27068 8.33333 4.63636C8.52715 3.68489 9.37805 3 10.3663 3H13.6337C14.6219 3 15.4728 3.68489 15.6667 4.63636C15.7959 5.27068 16.3631 5.76086 17.022 5.76086C18.4027 5.82123 19.3044 5.99013 20.0248 6.46268C20.51 6.78104 20.9267 7.19014 21.251 7.6666C22 8.76721 22 10.2994 22 13.3636C22 16.4279 22 17.9601 21.251 19.0607C20.9267 19.5371 20.51 19.9462 20.0248 20.2646C18.9038 21 17.3433 21 14.2222 21H9.77778C6.65675 21 5.09624 21 3.97524 20.2646C3.48995 19.9462 3.07328 19.5371 2.74902 19.0607C2.53746 18.7498 2.38566 18.4045 2.27673 18" 
                            stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                        <path d="M19 10H18" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                    <div class="text-center text-white">Capture</div>
                </div>
                <div>
                    <svg 
                        onClick={() => setFacingMode(prevMode => prevMode === "user" ? "environment" : "user")} 
                        height="50px" width="50px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14.5197 10.6799L14.2397 10.4C13.0026 9.16288 10.9969 9.16288 9.75984 10.4C8.52276 11.637 8.52276 13.6427 9.75984 14.8798C10.9969 16.1169 13.0026 16.1169 14.2397 14.8798C14.7665 14.353 15.069 13.6868 15.1471 13M14.5197 10.6799L13 11M14.5197 10.6799V9" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M2 13.3636C2 10.2994 2 8.76721 2.74902 7.6666C3.07328 7.19014 3.48995 6.78104 3.97524 6.46268C4.69555 5.99013 5.59733 5.82123 6.978 5.76086C7.63685 5.76086 8.20412 5.27068 8.33333 4.63636C8.52715 3.68489 9.37805 3 10.3663 3H13.6337C14.6219 3 15.4728 3.68489 15.6667 4.63636C15.7959 5.27068 16.3631 5.76086 17.022 5.76086C18.4027 5.82123 19.3044 5.99013 20.0248 6.46268C20.51 6.78104 20.9267 7.19014 21.251 7.6666C22 8.76721 22 10.2994 22 13.3636C22 16.4279 22 17.9601 21.251 19.0607C20.9267 19.5371 20.51 19.9462 20.0248 20.2646C18.9038 21 17.3433 21 14.2222 21H9.77778C6.65675 21 5.09624 21 3.97524 20.2646C3.48995 19.9462 3.07328 19.5371 2.74902 19.0607C2.53746 18.7498 2.38566 18.4045 2.27673 18" 
                            stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                    <div class="text-center text-white">Flip</div>
                </div>
            </div>
            <div ref={layoutAfterRef} class="w-full hidden flex justify-around">
                <div onClick={toggleCameraActivate}>
                    <svg width="50px" height="50px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 12.6111L8.92308 17.5L20 6.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <div class="text-center text-white">Use</div>
                </div>
                <div onClick={resetCamera} >
                    <svg width="50px" height="50px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                        <path fill="white" d="M14.9547098,7.98576084 L15.0711,7.99552 C15.6179,8.07328 15.9981,8.57957 15.9204,9.12636 C15.6826,10.7983 14.9218,12.3522 13.747,13.5654 C12.5721,14.7785 11.0435,15.5888 9.37999,15.8801 C7.7165,16.1714 6.00349,15.9288 4.48631,15.187 C3.77335,14.8385 3.12082,14.3881 2.5472,13.8537 L1.70711,14.6938 C1.07714,15.3238 3.55271368e-15,14.8776 3.55271368e-15,13.9867 L3.55271368e-15,9.99998 L3.98673,9.99998 C4.87763,9.99998 5.3238,11.0771 4.69383,11.7071 L3.9626,12.4383 C4.38006,12.8181 4.85153,13.1394 5.36475,13.3903 C6.50264,13.9466 7.78739,14.1285 9.03501,13.9101 C10.2826,13.6916 11.4291,13.0839 12.3102,12.174 C13.1914,11.2641 13.762,10.0988 13.9403,8.84476 C14.0181,8.29798 14.5244,7.91776 15.0711,7.99552 L14.9547098,7.98576084 Z M11.5137,0.812976 C12.2279,1.16215 12.8814,1.61349 13.4558,2.14905 L14.2929,1.31193 C14.9229,0.681961 16,1.12813 16,2.01904 L16,6.00001 L12.019,6.00001 C11.1281,6.00001 10.6819,4.92287 11.3119,4.29291 L12.0404,3.56441 C11.6222,3.18346 11.1497,2.86125 10.6353,2.60973 C9.49736,2.05342 8.21261,1.87146 6.96499,2.08994 C5.71737,2.30841 4.57089,2.91611 3.68976,3.82599 C2.80862,4.73586 2.23802,5.90125 2.05969,7.15524 C1.98193,7.70202 1.47564,8.08224 0.928858,8.00448 C0.382075,7.92672 0.00185585,7.42043 0.0796146,6.87364 C0.31739,5.20166 1.07818,3.64782 2.25303,2.43465 C3.42788,1.22148 4.95652,0.411217 6.62001,0.119916 C8.2835,-0.171384 9.99651,0.0712178 11.5137,0.812976 Z"/>
                    </svg>
                    <div class="text-center text-white">Retake</div>
                </div>
            </div>
        </div>
    </div>
  );
}

export default Camera;
