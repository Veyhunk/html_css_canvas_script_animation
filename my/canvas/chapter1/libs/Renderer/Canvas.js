function Canvas (layer) {
	this.canvas = document.createElement("canvas");
	this.context = this.canvas.getContext("2d");
	this.lock = true;
	this.layer = layer;
	this.setSize(layer.size);
	this.geometrys = {};
	layer.div.appendChild(this.canvas);
}
	
Canvas.prototype.setSize = function(size){
	this.canvas.width = size.w;
	this.canvas.height = size.h;
	this.canvas.style.width = size.w + "px";
	this.canvas.style.height = size.h + "px";
}
	
Canvas.prototype.drawGeometry = function(geometry, style){
	this.geometrys[geometry.id] = [geometry, style];
	//如果渲染器没有被锁定则可以进行重绘。
	if(!this.lock){
		this.redraw();
	}
}
	
Canvas.prototype.redraw = function(){
	this.context.clearRect(0, 0, this.layer.size.w, this.layer.size.h);
	var geometry;
	if(!this.lock){
		for(var id in this.geometrys){
			if(this.geometrys.hasOwnProperty(id)){
				geometry = this.geometrys[id][0];
				style = this.geometrys[id][1];
				this.draw(geometry, style, geometry.id);
			}			
		}
	}	
}
	
Canvas.prototype.draw = function(geometry, style, id){
	if(geometry instanceof Point){
		this.drawPoint(geometry, style, id);
	}
	//{todo} 我们在这里判断各种矢量要素的绘制。		
}

Canvas.prototype.drawPoint = function(geometry, style, id){
	var radius = style.pointRadius;
	var twoPi = Math.PI*2;
	var pt = this.getLocalXY(geometry);
	//填充
	if(style.fill) {
		this.setCanvasStyle("fill", style)
		this.context.beginPath();
		this.context.arc(pt.x, pt.y, radius, 0, twoPi, true);
		this.context.fill();
	}
	//描边
	if(style.stroke) {
		this.setCanvasStyle("stroke", style)
		this.context.beginPath();
		this.context.arc(pt.x, pt.y, radius, 0, twoPi, true);
		this.context.stroke();
	}
	this.setCanvasStyle("reset");
}

Canvas.prototype.setCanvasStyle = function(type, style) {
	if (type === "fill") {     
		this.context.globalAlpha = style['fillOpacity'];
		this.context.fillStyle = style['fillColor'];
	} else if (type === "stroke") {  
		this.context.globalAlpha = style['strokeOpacity'];
		this.context.strokeStyle = style['strokeColor'];
		this.context.lineWidth = style['strokeWidth'];
	} else {
		this.context.globalAlpha = 0;
		this.context.lineWidth = 1;
	}
}

Canvas.prototype.getLocalXY = function(point) {
	var resolution = this.layer.zoom / 100;
	var extent = this.layer.bounds;
	var x = (point.x * resolution + (-extent.left * resolution));
	var y = ((extent.top * resolution) - point.y * resolution);
	return new CanvasSketch.Position(x, y);
}