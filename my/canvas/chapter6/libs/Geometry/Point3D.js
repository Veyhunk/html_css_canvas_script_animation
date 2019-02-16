//CLASS: POINT3D���͡�
function Point3D(x, y, z){
	this.x = x;
	this.y = y;
	this.z = z;
}

Point3D.prototype.toDisPlayPoint = function() {
	var x = this.x - this.z;
	var y = this.y * this.CORRECT + (this.x + this.z) * 0.5;
	return new Point(x, y);
}

Point3D.prototype.CORRECT =  1.2247;

Point3D.prototype.geoType = "Point3D";

Point3D.prototype.clone = function() {
	return new Point3D(this.x, this.y, this.z);
}