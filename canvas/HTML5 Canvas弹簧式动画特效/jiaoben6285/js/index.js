var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}$('#canvas').attr('width', $(window).width());
$('#canvas').attr('height', $(window).height());

function createBall(color, rad) {
	var ball = new createjs.Shape();
	ball.graphics.beginFill(color).drawCircle(0, 0, rad);
	ball.vx = 0;
	ball.vy = 0;
	return ball;
}

function clamp(aMin, aNum, aMax) {
	return Math.min(Math.max(aMin, aNum), aMax);
}

var BALLS_NUM = 50;
var MOVE_TIME = 1500;

var ballsArr = [];
var stage = new createjs.Stage('canvas');
var lastTime = Date.now();var

Balls = function (_createjs$Container) {_inherits(Balls, _createjs$Container);

	function Balls() {_classCallCheck(this, Balls);var _this = _possibleConstructorReturn(this, (Balls.__proto__ || Object.getPrototypeOf(Balls)).call(this));

		_this.ballsNum = 3;
		_this.balls = [];
		_this.line = new createjs.Shape();

		_this.spring = _.random(5, 10) / 100;
		_this.springLength = _.random(10, 200);
		_this.friction = _.random(70, 95) / 100;

		for (var _i = 0; _i < _this.ballsNum; _i++) {
			_this['isActive' + _i] = false;
		}
		_this._setup();return _this;
	}_createClass(Balls, [{ key: '_setup', value: function _setup()

		{
			this.addChild(this.line);
			for (var _i2 = 0; _i2 < this.ballsNum; _i2++) {
				var color = createjs.Graphics.getRGB(0x999999, Math.random());
				var ball = createBall(color, _.random(3, 10));
				ball.x = Math.random() * stage.canvas.width;
				ball.y = Math.random() * stage.canvas.height;
				ball.id = _i2;
				this.balls.push(ball);
				this.addChild(ball);
			}
		} }, { key: 'move', value: function move()

		{var _this2 = this;
			var delay = _.random(300, 800);
			var targetID = Math.floor(Math.random() * this.balls.length);
			var target = this.balls[targetID];
			var cp = new createjs.Point(target.x, target.y);
			var lp = new createjs.Point(
			Math.random() * stage.canvas.width,
			Math.random() * stage.canvas.height);

			this['isActive' + target.id] = true;
			createjs.Tween.get(target).
			to({ x: lp.x, y: lp.y }, delay, createjs.Ease.bounceInOut()).
			call(function () {
				for (var _i3 = 0; _i3 < _this2.ballsNum; _i3++) {
					// console.log(this['isActive' + i]);
					_this2['isActive' + _i3] = false;
				}
			});
		} }, { key: 'springTo', value: function springTo(

		ballA, ballB) {
			var dx = ballB.x - ballA.x;
			var dy = ballB.y - ballA.y;
			var angle = Math.atan2(dy, dx);
			var targetX = ballB.x - Math.cos(angle) * this.springLength;
			var targetY = ballB.y - Math.sin(angle) * this.springLength;
			ballA.vx += (targetX - ballA.x) * this.spring;
			ballA.vy += (targetY - ballA.y) * this.spring;
			ballA.vx *= this.friction;
			ballA.vy *= this.friction;
			ballA.x += ballA.vx;
			ballA.y += ballA.vy;
		} }, { key: 'update', value: function update()

		{
			// Balls
			if (!this.isActive0) {
				this.springTo(this.balls[0], this.balls[1]);
				this.springTo(this.balls[0], this.balls[2]);
			}
			if (!this.isActive1) {
				this.springTo(this.balls[1], this.balls[0]);
				this.springTo(this.balls[1], this.balls[2]);
			}
			if (!this.isActive2) {
				this.springTo(this.balls[2], this.balls[0]);
				this.springTo(this.balls[2], this.balls[1]);
			}

			// Line
			this.line.graphics.
			clear().
			setStrokeStyle(1).
			beginStroke('#333').
			moveTo(this.balls[0].x, this.balls[0].y);
			for (var _i4 = 1, l = this.balls.length; _i4 < l; _i4++) {
				this.line.graphics.lineTo(this.balls[_i4].x, this.balls[_i4].y);
			}
			this.line.graphics.lineTo(this.balls[0].x, this.balls[0].y);
		} }]);return Balls;}(createjs.Container);


for (var i = 0; i < BALLS_NUM; i++) {
	var balls = new Balls();
	stage.addChild(balls);
	ballsArr.push(balls);
}

createjs.promote(Balls, 'Container');
createjs.Ticker.setFPS(60);
createjs.Ticker.addEventListener('tick', function () {
	ballsArr.forEach(function (ball) {
		ball.update();
	});
	var currentTime = Date.now();
	if (currentTime - lastTime > MOVE_TIME) {
		ballsArr.forEach(function (ball) {
			ball.move();
		});
		lastTime = currentTime;
	}

	stage.update();
});