let VIDEO=null;
const SIZE=600;
const WIDTH = 400;
const HEIGHT = 200;
let CANVAS;
let INTENSITY;
let TIME = 0;

function main(){
	//removeOverlay();

	CANVAS=initializeCanvas("camCanvas",WIDTH,HEIGHT);
	initializeCamera();
	let ctx=CANVAS.getContext("2d");

	setInterval(function(){
		drawScene(ctx);
	},100);  // once every 100 ms
}

function initializeCanvas(canvasName,width,height){
	let canvas = document.getElementById(canvasName);
	canvas.width=width;
	canvas.height=height;
	return canvas;
}

function drawScene(ctx){
	if (VIDEO != null) {
		let min = Math.min(VIDEO.videoWidth, VIDEO.videoHeight * 2);
		let sx = (VIDEO.videoWidth - min) / 2;
		let sy = (VIDEO.videoHeight * 2 - min) / 2;
		ctx.drawImage(VIDEO, sx, sy, VIDEO.videoWidth - sx * 2, VIDEO.videoHeight - sy,
		                    0, 0, WIDTH, HEIGHT);
	} else {
		// show loading
	}

	applyEffects(ctx);
}

function applyEffects(ctx) {
  let intensity = TIME * 0.001;
  if (intensity > 1) {
    intensity = 1;
  }
  // console.log(intensity)
  // applyGrayScale(ctx);
  // applyColorInvert(ctx);
  // applySymmetry(ctx);

  // applyMirroring(ctx);
	applyAverageSymmetry(ctx, 20 * intensity);
  applyCurve(ctx, 2 * intensity);
  applyContrast(ctx, 50 * intensity);
}

function applyCurve(ctx, intensity) { // Intensity is 0-100
  const imgData = ctx.getImageData(0, 0, WIDTH, HEIGHT);
  const data = imgData.data;
  const multiplier = intensity / 100;
  const frequency = 20;
  TIME++;
  const xOffset = TIME * 2;

  for (let y = 0; y < HEIGHT; y++) {

    for (let x = 0; x < WIDTH; x++) {   //r,g,b,at
      let newY = y;
      const xScalar = 0.5 * Math.sin((x - xOffset)/frequency) + 1;
      // console.log(xScalar);
      // const xScalar = 0;
      newY += Math.round(-(y / HEIGHT - 1) * (xScalar * WIDTH * multiplier));
			const pixel = getPixelValue(data, x, newY);

      data[(y * WIDTH + x) * 4 + 0] = pixel.red;
      data[(y * WIDTH+ x) * 4 + 1] = pixel.green;
      data[(y * WIDTH+ x) * 4 + 2] = pixel.blue;
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

function applyContrast(ctx, contrast){  //input range [-100..100]
  const imgData = ctx.getImageData(0, 0, WIDTH, HEIGHT);
  const data = imgData.data;
  contrast = (contrast / 100) + 1;  //convert to decimal & shift range: [0..2]
  const intercept = 128 * (1 - contrast);

  for (let y = 0; y < HEIGHT; y++) {

    for (let x = 0; x < WIDTH; x++) {   //r,g,b,a
			const pixel = getPixelValue(data,x,y);

      data[(y * WIDTH + x) * 4 + 0] = pixel.red * contrast + intercept;
      data[(y * WIDTH + x) * 4 + 1] = pixel.green * contrast + intercept;
      data[(y * WIDTH + x) * 4 + 2] = pixel.blue * contrast + intercept;
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

function applyAverageSymmetry(ctx, strength) { // strenght is 0-100
  const imgData = ctx.getImageData(0, 0, WIDTH, HEIGHT);
	const data = imgData.data;
  strength = strength / 100;
	for (let y = 0; y < HEIGHT; y++) {
		/*
		x :      SIZE/2 ... SIZE
		SIZE-x:  SIZE/2 ... 0
		*/
 		for (let x = 0; x < WIDTH; x++) {
			let pixelLeft = getPixelValue(data, WIDTH - x - 1, y);
			let pixelRight = getPixelValue(data, x, y);

			data[(y * WIDTH + x) * 4 + 0] = (strength * pixelLeft.red + pixelRight.red) / 2;
			data[(y * WIDTH + x) * 4 + 1] = (strength * pixelLeft.green + pixelRight.green) / 2;
			data[(y * WIDTH + x) * 4 + 2] = (strength * pixelLeft.blue + pixelRight.blue) / 2;
		}
	}
	ctx.putImageData(imgData, 0, 0);
}

// function applyMirroring(ctx){
//   const imgData = ctx.getImageData(0, 0, WIDTH, HEIGHT);
// 	let data=imgData.data;
// 	for(let y=0;y<SIZE;y++){
//  		for(let x=0;x<SIZE/2;x++){
// 			let pixelRight=getPixelValue(data,SIZE-x-1,y);
// 			let pixelLeft=getPixelValue(data,x,y);
//
// 			//swap
// 			let aux=pixelRight;
// 			pixelRight=pixelLeft;
// 			pixelLeft=aux;
//
// 			data[(y*SIZE+x)*4+0]=pixelLeft.red;
// 			data[(y*SIZE+x)*4+1]=pixelLeft.green;
// 			data[(y*SIZE+x)*4+2]=pixelLeft.blue;
//
// 			data[(y*SIZE+(SIZE-x))*4+0]=pixelRight.red;
// 			data[(y*SIZE+(SIZE-x))*4+1]=pixelRight.green;
// 			data[(y*SIZE+(SIZE-x))*4+2]=pixelRight.blue;
// 		}
// 	}
// 	ctx.putImageData(imgData,0,0)
// }
//
// function applySymmetry(ctx){
// 	let imgData=ctx.getImageData(0,0,SIZE,SIZE);
// 	let data=imgData.data;
// 	for(let y=0;y<SIZE;y++){
// 		/*
// 		x :      SIZE/2 ... SIZE
// 		SIZE-x:  SIZE/2 ... 0
// 		*/
//  		for(let x=SIZE/2;x<SIZE;x++){
// 			let pixel=getPixelValue(data,SIZE-x,y);
//
// 			data[(y*SIZE+x)*4+0]=pixel.red;
// 			data[(y*SIZE+x)*4+1]=pixel.green;
// 			data[(y*SIZE+x)*4+2]=pixel.blue;
// 		}
// 	}
// 	ctx.putImageData(imgData,0,0)
// }
//
// function applyColorInvert(ctx){
// 	let imgData=ctx.getImageData(0,0,SIZE,SIZE);
// 	let data=imgData.data;
// 	for(let y=0;y<SIZE;y++){
// 		for(let x=0;x<SIZE;x++){
// 			let pixel=getPixelValue(data,x,y);
//
// 			data[(y*SIZE+x)*4+0]=255-pixel.red;
// 			data[(y*SIZE+x)*4+1]=255-pixel.green;
// 			data[(y*SIZE+x)*4+2]=255-pixel.blue;
// 		}
// 	}
// 	ctx.putImageData(imgData,0,0)
// }

// function applyGrayScale(ctx){
// 	let imgData=ctx.getImageData(0,0,SIZE,SIZE);
// 	let data=imgData.data;
// 	for(let y=0;y<SIZE;y++){
// 		for(let x=0;x<SIZE;x++){
// 			let pixel=getPixelValue(data,x,y);
//
// 			let avg=(pixel.red+pixel.green+pixel.blue)/3;
//
// 			data[(y*SIZE+x)*4+0]=avg;
// 			data[(y*SIZE+x)*4+1]=avg;
// 			data[(y*SIZE+x)*4+2]=avg;
// 		}
// 	}
// 	ctx.putImageData(imgData,0,0)
// }

function getPixelValue(data, x, y, xOffset = 0){
	return{
		red:   data[(y * (WIDTH + xOffset) + x) * 4 + 0],
		green: data[(y * (WIDTH + xOffset) + x) * 4 + 1],
		blue:  data[(y * (WIDTH + xOffset) + x) * 4 + 2],
		alpha: data[(y * (WIDTH + xOffset) + x) * 4 + 3],
	}
}

function initializeCamera(){
	let promise=navigator.mediaDevices.getUserMedia({video:{facingMode: 'environment'}, audio: false});
	promise.then(function(signal){
		VIDEO=document.createElement("video");
		VIDEO.srcObject=signal;
		VIDEO.play();
	}).catch(function(err){
		alert("Camera Error");
	});
}

function removeOverlay(){
	let element = document.getElementById("overlay")
	element.style.display="none";
}

main();
