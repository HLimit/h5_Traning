$(function () {

	var data = {
		CellSide:20,
		GameCanvasXCellCount: 30,
		GameCanvasYCellCount: 20,
		GameCanvasBackColor:"#F5F5DC",
		FoodColor:"Red",
		SnakeColor:"#080808",
		InitSnakeLength:3,
	}
    
    //正方形栅格，所有图形均由栅格拼成
	var Cell = function(x,y,c,s,f){
		//横坐标
		this.X = x;
		//纵坐标
		this.Y = y;
		//颜色
		this.Color = c;
		//变长
		this.Side = s;
		//是否填充，1填充（表示该栅格已经被占用），2未填充（表示该栅格还未被占用）
		this.Fill = f || 1;

		this.OX = this.X * this.Side;
		this.OY = this.Y * this.Side;
	};


	//画布
	var GameCanvas = function(xcc,ycc,cs,bc){

		this.ID = 'MainGameWindow';
		//横坐标方向栅格个数
		this.XCellCount = xcc || data.GameCanvasXCellCount;
		//纵坐标方向栅格个数
		this.YCellCount = ycc || data.GameCanvasYCellCount;
		//栅格边长单位px
		this.CellSide = cs || data.CellSide;

		this.BackColor = bc || data.GameCanvasBackColor;

		this.Width = this.XCellCount * this.CellSide;

		this.Height = this.YCellCount * this.CellSide;

		this.Initialize.apply(this);
	}

	_.extend(GameCanvas.prototype, {
		Initialize: function(){
			var _this = this;
			var canvas = document.getElementById(_this.ID);
			if (canvas == null)
				return false;
			canvas.width = _this.Width;
			canvas.height = _this.Height;
			_this.CanvasContext = canvas.getContext("2d");
			_this.Refresh.apply(_this);
		},
		Refresh: function(){
			var _this = this;
			_this.CanvasContext.fillStyle = _this.BackColor;
			_this.CanvasContext.fillRect(0, 0, _this.Width, _this.Height);
		},
		DrawDie: function(){
			var _this = this;
			//_this.CanvasContext.fillStyle = _this.BackColor;
			//_this.CanvasContext.fillRect(0, 0, _this.Width, _this.Height);
			_this.CanvasContext.fillStyle = "Red";
			_this.CanvasContext.font = "italic 30px sans-serif";
			_this.CanvasContext.textBaseline = 'top';
            _this.CanvasContext.fillText("You Die!", 160, 160);
            _this.CanvasContext.font = "20px Arial";
			_this.CanvasContext.textBaseline = 'top';
            _this.CanvasContext.fillText("Press Ctrl+F5 to play again.", 200, 200);
		}
	});

	var Food = function(canvas,color){
		this.Container = canvas;
		//横坐标
		this.X = 0;
		//纵坐标
		this.Y = 0;
		//颜色 
		this.Color = color || data.FoodColor;
		//变长
		this.Side = this.Container.CellSide;

		this.OX = this.X * this.Side;
		this.OY = this.Y * this.Side;

		//横坐标方向栅格个数
		this.XCellCount =  this.Container.XCellCount;
		//纵坐标方向栅格个数
		this.YCellCount = this.Container.YCellCount;
		this.CreateNew.apply(this);
	}

	_.extend(Food.prototype, {
		Refresh: function(){
			var _this = this;
			_this.Container.CanvasContext.fillStyle = _this.Color;
			_this.Container.CanvasContext.fillRect(_this.OX, _this.OY, _this.Side, _this.Side);
		},
		CreateNew: function(){
			var _this = this;
			var rx = Math.floor(Math.random() * _this.XCellCount);
			var ry = Math.floor(Math.random() * _this.YCellCount);
			_this.X = rx;
			_this.Y = ry;
			this.OX = this.X * this.Side;
			this.OY = this.Y * this.Side;
			_this.Container.CanvasContext.fillStyle = _this.Color;
			_this.Container.CanvasContext.fillRect(_this.OX, _this.OY, _this.Side, _this.Side);
			return _this;
		},
		ClearOld: function(){
			var _this = this;
			_this.Container.CanvasContext.fillStyle = _this.Container.BackColor;
			_this.Container.CanvasContext.fillRect(_this.OX, _this.OY, _this.Side, _this.Side);
			return _this;
		},
		ClearOldAndCreateNew: function(){
			this.ClearOld.apply(this);
			this.CreateNew.apply(this);
			return this;
		}
	});

	var Snake = function(canvas, food, color, initlenth){
		this.Container = canvas;
		this.Food = food;
		this.SnakeCellArray = [];
		this.CellSide = this.Container.CellSide;
		this.InitSnakeLength = initlenth || data.InitSnakeLength;
		this.SnakeColor = color || data.SnakeColor;
		this.Direction = "D";
		//横坐标方向栅格个数
		this.XCellCount = this.Container.XCellCount;
		//纵坐标方向栅格个数
		this.YCellCount = this.Container.YCellCount;
		this.Initialize.apply(this);
		this.DIE = false;
	}

	_.extend(Snake.prototype, {
		Initialize: function(){
			var _this = this;
			for (var i = 0; i < _this.InitSnakeLength; i++) {
				var cell = new Cell(0, i, _this.SnakeColor, _this.CellSide);
				_this.SnakeCellArray.unshift(cell);
			};
			_this.Refresh.apply(_this);
		},
		Refresh: function(){
			var _this = this;
			$.each(_this.SnakeCellArray, function(i, cell){
				_this.Container.CanvasContext.fillStyle = cell.Color;
				_this.Container.CanvasContext.fillRect(cell.OX, cell.OY, cell.Side, cell.Side);
			});
			if(_this.ClearCell){
				_this.Container.CanvasContext.fillStyle = _this.Container.BackColor;
				_this.Container.CanvasContext.fillRect(_this.ClearCell.OX, _this.ClearCell.OY, _this.ClearCell.Side, _this.ClearCell.Side);
				_this.ClearCell = null;
			}
			_this.Food.Refresh();
			$('#score').html(_this.SnakeCellArray.length-3);
		},
		Move: function(){
			if(this.DIE)
				return false;
			var _this = this;
			var fistCell = _this.SnakeCellArray[0];
			var nextX = fistCell.X;
			var nextY = fistCell.Y;
			if(_this.Direction == "U"){
				nextY = nextY - 1;
			}
			else if(_this.Direction == "D"){
				nextY = nextY + 1;
			}
			else if(_this.Direction == "L"){
				nextX = nextX - 1;
			}
			else if(_this.Direction == "R"){
				nextX = nextX + 1;
			}
			if(!_this.CheckDie(nextX,nextY)){
				this.DIE = true;
				_this.Container.DrawDie();
				return false;
			}
			var nextCell = new Cell(nextX, nextY, fistCell.Color, fistCell.Side);
			_this.SnakeCellArray.unshift(nextCell);
			_this.ClearCell = _this.SnakeCellArray.pop();
			if(_this.CheckFood(nextX,nextY)){
				var nextCell = new Cell(_this.Food.X, _this.Food.Y, fistCell.Color, fistCell.Side);
				_this.SnakeCellArray.unshift(nextCell);
				_this.Food = _this.Food.ClearOldAndCreateNew();
			}
			else if(_this.CheckFood2(nextX,nextY)){
				var newX = _this.Food.X;
				var newY = _this.Food.Y;
				if(_this.Direction == "U"){
					newY = newY - 1;
				}
				else if(_this.Direction == "D"){
					newY = newY + 1;
				}
				else if(_this.Direction == "L"){
					newX = newX - 1;
				}
				else if(_this.Direction == "R"){
					newX = newX + 1;
				}
				var nextCell = new Cell(newX, newY, fistCell.Color, fistCell.Side);
				_this.SnakeCellArray.unshift(nextCell);
				_this.Food = _this.Food.ClearOldAndCreateNew();
			}
			_this.Refresh.apply(_this);
			return true;
			
		},
		ChangeToDirection: function(d){
			var _this = this;
			if((_this.Direction == "U" && d == "D")||(_this.Direction == "D" && d == "U")
				||(_this.Direction == "L" && d == "R")||(_this.Direction == "R" && d == "L")){
				return false;
			}
			else if(d == "D"||d == "U"||d == "L"||d == "R"){
				_this.Direction = d;
				return true;
			}
			else{
				return false;
			}
		},
		CheckDie: function(nextX,nextY){
			var _this = this;
			if(nextX < 0 || nextY < 0 || nextX >= _this.XCellCount || nextY >= _this.YCellCount){
				return false;
			}
			var fistCell = _this.SnakeCellArray[0];
			var fistX = fistCell.X;
			var fistY = fistCell.Y;
			for (var i = _this.SnakeCellArray.length - 1; i > 0; i--) {
				if(_this.SnakeCellArray[i].X == fistX && _this.SnakeCellArray[i].Y == fistY)
					return false;
			};
			return true;
		},
		CheckFood: function(nextX,nextY){
			var _this = this;
			if(_this.Direction == "U" && nextX == _this.Food.X && nextY == (_this.Food.Y+1)){
				return true;
			}
			else if(_this.Direction == "D" && nextX == _this.Food.X && nextY == (_this.Food.Y-1)){
				return true;
			}
			else if(_this.Direction == "L" && nextX == (_this.Food.X+1) && nextY == _this.Food.Y){
				return true;
			}
			else if(_this.Direction == "R" && nextX == (_this.Food.X-1) && nextY == _this.Food.Y){
				return true;
			}
			else{
				return false;
			}
		},
		CheckFood2: function(nextX,nextY){
			var _this = this;
			if(nextX == _this.Food.X && nextY == _this.Food.Y){
				return true;
			}
			else{
				return false;
			}
		}
	});

	var GameController = function(){

		var _this = this;

		document.onkeydown = function(){
			_this.ChangeDirection();
		} 
		this.Initialize.apply(this);
	}
	
	_.extend(GameController.prototype, {
		Initialize: function(){
			var gameCanvas = new GameCanvas();
		    var food = new Food(gameCanvas);
		    var snake = new Snake(gameCanvas,food);
		    this.Snake = snake;
		},
		
		ChangeDirection: function(){
			
			var _this = this;
			//左 
			var cdr = false;
			if (event.keyCode == 37){
				cdr = _this.Snake.ChangeToDirection("L");
			}
			//上
			else if (event.keyCode == 38){
				cdr = _this.Snake.ChangeToDirection("U");
			}
			//右
			else if (event.keyCode == 39){
				cdr = _this.Snake.ChangeToDirection("R");
			}
			//下 
			else if (event.keyCode == 40){
				cdr = _this.Snake.ChangeToDirection("D");
			}
			if(cdr)
				 _this.Snake.Move();
		},
		Run: function(){
			var _this = this;
			var snakeTimer = setInterval(function() {
				var res = _this.Snake.Move();
				if(!res){
					clearInterval(snakeTimer);
				}
			},300)
		}
	});

   
    var game = new GameController();
    game.Run();
})