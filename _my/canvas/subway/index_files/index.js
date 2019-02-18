var dm = new ht.DataModel();//数据容器
var gv = new ht.graph.GraphView(dm);//拓扑组件

var lineNum = ['1', '2', '3', '30', '4', '5', '6', '7', '8', '9', '13', '14', '32', '18', '21', '22', '60', '68'];
var color = ['#f1cd44', '#0060a1', '#ed9b4f', '#ed9b4f', '#007e3a', '#cb0447', '#7a1a57', '#18472c', '#008193', '#83c39e', '#8a8c29', '#82352b', '#82352b', '#09a1e0', '#8a8c29', '#82352b', '#b6d300', '#09a1e0'];
var names = [
	{name: '一号线', value: 1}, {name: '二号线', value: 2}, {name: '三号线', value: 3}, 
	{name: '三北线', value: 30}, {name: '四号线', value: 4}, {name: '七号线', value: 7}, 
	{name: '八号线', value: 8}, {name: '九号线', value: 9}, {name: '广佛线', value: 60}, 
	{name: 'APM线', value: 68}, {name: '十三号线', value: 13}, {name: '十四号线', value: 14}, 
	{name: '十四北线', value: 32}, {name: '二十二号线', value: 22}, 
	
];

function init(){
	lineNum.forEach( function(num, index) {
		//绘制地铁图上的line
		createLine(num, color[index]);

		//绘制线上的点
		var markName = 'mark_Point' + num;
		var markP = window[markName];//"线路点"，每条线路的起点和终点都会有显示这条线路的名称，如：Line1
		var lineName = 'Line' + num;//线路名称

		for (let i = 0; i < markP.length; i++) {
			let node = createNode(markP[i].name, markP[i].value, color[index]);

			if (num === '68') node.s('label', 'A P M');
			else if (num === '60') node.s('label', 'G F'); 
			else node.s('label', lineName);

			node.s({
				'label.color': '#fff',
				'label.position': 17,
				'label.font': 'bold 12px arial, sans-serif'
			});
			node.setImage('');
		}

		var tName = 't_Point' + num;
		var tP = window[tName];//大站点
		if (tP) {//有些线路没有“换乘站点”
			for (let i = 0; i < tP.length; i++) {
				let node = createNode(tP[i].name, tP[i].value, color[index]);//在获取的线路上的点的坐标位置添加节点
				node.s({//设置节点的样式style
					'label.scale': 0.05,//文本缩放，可以避免浏览器限制的最小字号问题
					'label.font': 'bold 12px arial, sans-serif'//设置文本的font
				});
				node.setSize(0.6, 0.6);//设置节点大小。由于js中每个点之间的偏移量太小，所以我不得不把节点设置小一些
				node.setImage('images/旋转箭头.json');//设置节点的图片
				node.a('alarmColor1', 'rgb(150, 150, 150)');//attr属性，可以在这里面设置任何的东西，alarmColor1是在上面设置的image的json中绑定的属性，具体参看 HT for Web 矢量手册
				node.a('alarmColor2', 'rgb(150, 150, 150)');//同上
				node.a('tpNode', true);//这个属性设置只是为了用来区分“换乘站点”和“小站点”的，后面会用上
			}
		}

		var nName = 'n_Point' + num;
		var nP = window[nName];//小站点
		for (let i = 0; i < nP.length; i++) {
			let node = createNode(nP[i].name, nP[i].value, color[index]);
			node.setImage('images/小站点.json');
			node.a('npColor', 'rgb(150, 150, 150)');
			node.a('npNode', true);
		}
	});

	
	gv.setLayers(['0', 'middle', 'top']);//设置层次index越大的显示越上层
	gv.fitContent(false, 0);//自适应大小
	gv.setMovableFunc(function() {//设置gv上的节点不可移动
		return false;
	});
	gv.addToDOM();//将拓扑图组件添加进body中
	var form = createForm();//创建表单
	createH1();

	window.addEventListener('resize', function(e) {//窗口大小变化事件
		gv.fitContent(false, 0);//重新设置gv的自适应，只是不需要动画，否则上一次的动画没有结束，下一次的动画又来了，会混乱
	});

	var name, interval;
	gv.getView().addEventListener('mousemove', function(e) {
		var data = gv.getDataAt(e);//传入逻辑坐标点或者交互event事件参数，返回当前点下的图元
		if (name) {
			originNode(name);//让节点保持原来的大小
		}
		if (!(data instanceof ht.Node && data.a('tpNode'))) {//鼠标除了在“大站点”上，其他情况图标都不旋转
			clearInterval(interval);
		}

		if (data instanceof ht.Polyline) {//判断事件节点的类型
			dm.sm().ss(data);//选中“管道”
			name = '';
		}
		else if (data instanceof ht.Node) {
			if (data.getTag() !== name && data.a('tpNode')) {//若不是同一个节点，并且mousemove的事件对象为ht.Node类型，那么设置节点的旋转
				interval = setInterval(function() {
					data.setRotation(data.getRotation() - Math.PI/16);//在自身旋转的基础上再旋转
				}, 100);
			}
			expandNode(data, name);//放大节点
			dm.sm().ss(data);//设置选中节点
			name = data.getTag();//作为“上一个节点”的存储变量，可以通过这个值来获取节点

			data.s('label.background', 'rgba(0, 0, 0, 0.75)')
		}
		else {//其他任何情况则不选中任何内容
			dm.sm().ss(null);
			name = '';
		}
	});

	var redLight = createRedLight();//创建一个新的节点，显示为“红灯”的样式
	gv.mi(function(e) {//ht 中拓扑组件中的事件监听 针对上面创建的“红灯”节点
		if (e.kind === 'clickData' && (e.data.a('tpNode') || e.data.a('npNode'))) {//e.kind获取当前事件类型，e.data获取当前事件下的节点
			redLight.s('2d.visible', true);//设置node节点可见
			redLight.setPosition(e.data.getPosition().x, e.data.getPosition().y);//设置node的坐标为当前事件下节点的位置
		}
		else if (e.kind === 'doubleClickData') {//双击节点
			gv.fitData(e.data, false, 10);//将事件下的节点自适应到拓扑图的中央，参数1为自适应的节点，参数2为是否动画，参数3为gv与边框的padding
		}
		else if (e.kind === 'doubleClickBackground') {//双击空白处
			redLight.s('2d.visible', false);//设置node节点不可见
		}
	});

	gv.enableToolTip();
	dm.enableAnimation();
}
function createRedLight() {//选中站点后在该站点上方创建一个红色的节点
	var node = new ht.Node();
	node.setImage('images/红灯.json');//设置节点的图片
	node.setSize(1, 1);//设置节点的大小
	node.setLayer('top');//设置节点显示在gv的最上层
	node.s('2d.visible', false);//节点不可见
	node.s('select.width', 0);//节点选中时的边框为0，不可见
	node.s('2d.selectable', false);//设置这个属性，则节点不可选中

	node.setAnimation({//设置动画
		expandWidth: {
            property: "width",//设置这个属性，并且未设置 accessType，则默认通过 setWidth/getWidth 来设置和获取属性。这里的 width 和下面的 height 都是通过前面设置的 size 得到的
            from: 0.5, //动画开始时的属性值
            to: 1,//动画结束时的属性值
            next: "collapseWidth"//字符串类型，指定当前动画完成之后，要执行的下个动画，可将多个动画融合
        },
        collapseWidth: {
            property: "width",
            from: 1, 
            to: 0.5,
            next: "expandWidth"
        },
        expandHeight: {
            property: "height",
            from: 0.5, 
            to: 1,
            next: "collapseHeight"
        },
        collapseHeight: {
            property: "height",
            from: 1, 
            to: 0.5,
            next: "expandHeight"
        },
        start: ["expandWidth", "expandHeight"]//数组，用于指定要启动的一个或多个动画
	});
	dm.add(node);
	return node;
}
function expandNode(data, name) {//本来大小的节点，则设置节点变大一些，文字也大一些
	if (data.a('tpNode') && data.getSize().width === 0.6) {
		data.setSize(0.8, 0.8);
		data.s('label.scale', 0.07);
		data.a('alarmColor1', 'rgb(51,153,255)');
		data.a('alarmColor2', 'rgb(51,153,255)');
	}
	else if (data.a('npNode') && data.getSize().width === 0.4) {
		data.setSize(0.6, 0.6);
		data.s('label.scale', 0.05);
		data.a('npColor', 'rgb(51,153,255)');
	}
}
function originNode(name) {//已经变大了的节点，则设置节点和文字都变回原来的大小
	var node = dm.getDataByTag(name);//通过tag标签获取上一次鼠标事件得到的对象
	if (node.a('tpNode') && node.getSize().width === 0.8) {//如果是“大站点”
		node.setSize(0.6, 0.6);
		node.s('label.scale', 0.05);
		node.a('alarmColor1', 'rgb(150, 150, 150)');
		node.a('alarmColor2', 'rgb(150, 150, 150)');
	}
	else if (node.a('npNode') && node.getSize().width === 0.6) {//小站点
		node.setSize(0.4, 0.4);
		node.s('label.scale', 0.03);
		node.a('npColor', 'rgb(150, 150, 150)');
	}
	node.s('label.background', '');
}
function createLine(num, color) {//绘制地图线
	var polyline = new ht.Polyline();//多边形 管线
	polyline.setTag(num);//设置节点tag标签，作为唯一标示
	
	if (num === '68') polyline.setToolTip('A P M');//设置提示信息 
	else if (num === '60') polyline.setToolTip('G F'); 
	else polyline.setToolTip('Line' + num);

	if (color) {
		polyline.s({//s 为 setStyle 的简写，设置样式
			'shape.border.width': 0.4,//设置多边形的边框宽度
			'shape.border.color': color,//设置多边形的边框颜色
			'select.width': 0.2,//设置选中节点的边框宽度
			'select.color': color,//设置选中节点的边框颜色
			'shape.border.cap': 'round'
		});
	}

	let lineName = 'Line' + num;
	let line = window[lineName];
	for (let i = 0; i < line.length; i++) {
		for (let j = 0; j < line[i].coords.length; j++) {
			polyline.addPoint({x: line[i].coords[j][0]*300, y: -line[i].coords[j][1]*300});
			
			if (num === '68') {//APM线（有两条，但是点是在同一个数组中的）
				if (i === 0 && j === 0) {
					polyline.setSegments([1]);
				}
				else if (i === 1 && j === 0) {
					polyline.getSegments().push(1);
				}
				else {
					polyline.getSegments().push(2);
				}
			}	
		}
	}

	polyline.setLayer('0');//将线设置在下层，点设置在上层“middle”
	dm.add(polyline);//将管线添加进数据容器中储存，不然这个管线属于“游离”状态，是不会显示在拓扑图上的
	return polyline;
}
function createNode(name, pointsArr, color) {//添加地图上的点
	var node = new ht.Node();
	node.setTag(name);
	node.setSize(0.4, 0.4);//设置大小
	node.setLayer('middle');//设置节点在中间层“middle”
	
	node.a({//设置自定义属性，并设置默认值
		'alarmColor1': '#fff',
		'alarmColor2': '#fff',
		'npColor': '#fff'
	});

	if (name && color) {
		node.s({//设置节点样式
			'label': name,//文本内容，一般显示在节点下方
			'label.color': 'rgb(235, 235, 235)',//文本颜色
			'label.scale': 0.03,//文本大小，一般浏览器有限定最小字号，设置这个值不需要担心这个问题
			'label.offset.y': 0,//文本y轴偏移
			'label.selectable': false,//选中节点是否可选中文本
			'select.width': 0//选中节点外边框的宽度
		});
	}

	if (pointsArr) {
		node.setPosition(pointsArr[0]*300, -pointsArr[1]*300);//因为过来的数据偏移量比较小，这里放大了300倍
	}

	dm.add(node);
	return node;
}
function createForm() {//创建右下角的form表单
	var form = new ht.widget.FormPane();
	// form.setWidth(document.documentElement.clientWidth*0.1);//设置表单宽度
	// form.setHeight(document.documentElement.clientHeight*0.5);//设置表单高度
	form.setWidth(150);
	form.setHeight(360);
	form.setRowHeight(18);
	// form.setVGap(-form.getRowHeight());
	var view = form.getView();
	document.body.appendChild(view);//将表单添加进body中
	view.style.bottom = '0px';//ht组件几乎都设置绝对路径
	view.style.right = '0px';
	view.style.background = 'rgba(0, 0, 0, 0.75)';

	names.forEach(function(nameString) {
		form.addRow([//向表单中添加行
			{//这一行中的第一个表单项
				button: {//向表单中添加button按钮
					icon: 'images/Line'+nameString.value+'.json',//设置按钮的图标
					background: '',//设置按钮的背景
					borderColor: '',//设置按钮的边框颜色
					onClicked: function() {
						gv.sm().ss(dm.getDataByTag(nameString.value));//设置选中按下的按钮对应的线路
						gv.fitData(gv.sm().ld(), true, 5);//将选中的地铁线路显示在拓扑图的中央
					}
				}
			},
			{
				element: nameString.name,
				font: 'bold 12px arial, sans-serif',
				color: '#fff',
				align: 'left'
			}
		], [0.1, 0.2]);//第二个参数是设置第一参数中的数组的宽度，小于1是比例，大于1是实际宽度。第三个参数是该行的高度
	});
	return form;
}
function createH1() {
	var div = document.createElement('div');
	var h1 = document.createElement('h1');//添加一个h1标签
	h1.innerHTML = 'HT for Web 地铁线路图';
	h1.style.color = '#fff';
	h1.style.font = 'bold 24px arial sans-serif';
	h1.style.textAlign = 'center';
	document.body.appendChild(div);
	div.style.position = 'absolute';
	div.style.width = '100%';
	div.style.background = 'rgba(0, 0, 0, 0.75)';
	div.appendChild(h1);
}