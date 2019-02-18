<!DOCTYPE html>
<html>
    <head>
        <meta charset='utf-8'>
        <title>图片加载平移放大缩小示例</title>
        <style>
            html,body{
                margin:0px;
                padding:0px;
            }
            canvas{
                border: 1px solid #000;
            }        
            
        </style>
    </head>
    <body>
        <div id="testid">
        <div id="div1" style="width:100px; height:20px;"></div>
        <canvas id="canvas" width="500" height="500" style="margin-left:20px; margin-top:20px;" onMouseMove="cnvs_getCoordinates(event);"></canvas>
        <script type="text/javascript" src="main.js"></script>
        </div>
    </body>
</html>

js代码

var canvas,context;
var img,//图片对象
    icon,
    imgIsLoaded,//图片是否加载完成;
    iconIsLoaded,//图片是否加载完成;
    imgX=0,
    imgY=0,
    
    imgScale=1;
    initX = 50;
    initY=50;
    iconX=initX;
    iconY=initY;
//var iconarr = new Array(1);

(function int(){
    canvas=document.getElementById('canvas');
    context=canvas.getContext('2d');
    loadImg();
})();

function loadImg(){
    img=new Image();
    img.onload=function(){
        imgIsLoaded=true;
        drawImage();
    }
    img.src="ABCDE.svg"; //矢量图
    icon=new Image();
    icon.onload=function(){
        iconIsLoaded=true;
        drawImage();
    }
    
    icon.src="icon_6.png"; // 地图上的图标
}

function drawImage(){
    context.clearRect(0,0,canvas.width,canvas.height);
    context.drawImage(img,0,0,img.width,img.height,imgX,imgY,img.width*imgScale,img.height*imgScale);    
    context.drawImage(icon,iconX,iconY);
    
}

canvas.onmousedown=function(event){
    var pos=windowToCanvas(canvas,event.clientX,event.clientY);
    canvas.onmousemove=function(event){
        canvas.style.cursor="move";
        var pos1=windowToCanvas(canvas,event.clientX,event.clientY);
        var x=pos1.x-pos.x;
        var y=pos1.y-pos.y;
        pos=pos1;
        imgX+=x;
        imgY+=y;
        iconX=imgX+initX;
        iconY=imgY+initY;
        drawImage();
    }
    canvas.onmouseup=function(){
        canvas.onmousemove=cnvs_getCoordinates;
        canvas.onmouseup=null;
        canvas.style.cursor="default";
    }
}
canvas.onmousewheel=canvas.onwheel=function(event){
    var pos=windowToCanvas(canvas,event.clientX,event.clientY);
    event.wheelDelta=event.wheelDelta?event.wheelDelta:(event.deltaY*(-40));
    if(event.wheelDelta>0){
        imgScale*=2;
        imgX=imgX*2-pos.x;
        imgY=imgY*2-pos.y;
        initX = initX*2;
        initY = initY*2;
        iconX=imgX+initX;
        iconY=imgY+initY;
    }else{
        imgScale/=2;
        imgX=imgX*0.5+pos.x*0.5;
        imgY=imgY*0.5+pos.y*0.5;
        initX = initX/2;
        initY = initY/2;
        iconX=imgX+initX;
        iconY=imgY+initY;
    }
    drawImage();
}

function windowToCanvas(canvas,x,y){
    var bbox = canvas.getBoundingClientRect();
    return {
        x:x - bbox.left - (bbox.width - canvas.width) / 2,
        y:y - bbox.top - (bbox.height - canvas.height) / 2
    };
}

function cnvs_getCoordinates(event)
{
    var pos=windowToCanvas(canvas,event.clientX,event.clientY);
    var w = iconX + icon.width;
    var h = iconY + icon.height;
    var mydiv=document.getElementById("div1");
    mydiv.innerHTML = 'eventX='+pos.x +'eventY='+pos.y +'iconX='+iconX +'iconY='+iconY ;
    if (pos.x >= iconX && pos.x <= w && pos.y >= iconY && pos.y <= h){
        // 当鼠标移动到icon上时，显示abc
        mydiv.innerHTML = 'abc';
    } else {
        
    }
}