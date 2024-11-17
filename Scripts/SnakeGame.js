/**
 * A NodeScript that implements the well known Snake Game in Physion.
 * 
 * Using this NodeScript:
 * - Create a new Scene in Physion
 * - Add this script to the Scene's assets:
 *   - Open the Assets Library of the Scene (Edit Menu => Assets Library).
 *   - Add a new Text/JavaScript Asset in the library.
 *   - Paste the contents of this script in the text editor.
 *   - Click the "Apply" button to save the changes.
 *   - Close the Assets Library dialog
 * - Attach the script to the Scene:
 *   - Select the Scene (if not already selected)
 *   - Using the Property Editor, locate the "Scripts" property and click the "Edit" button.
 *   - From the modal dialog that pops-up, enable this Script (it should be named "SnakeGame")
 * - Start the simulation.
 * - Use arrow keys to play the game.
 */
class SnakeGame {

	/**
	 * SnakeGame constructor
	 * 
	 * This will be called when this script is assigned to the Scene.
	 * Note that this happens both when you first assign the script to the Scene via the PropertyEditor
	 * but also it will also get called when the Scene is loaded from the server. When the Scene is 
	 * loaded from the server it will contain no children.
	 * 
	 * Note that we're delaying the actual initialization; the actual initialization will happen upon
	 * the first `update` call.
	 */
	constructor(scene) {
		this.scene = scene;
		this.initialized = false;
	}

	/**
	 * Method to initialize the game.
	 * 
	 * When this method is called, it will reset the game's state. That is:
	 * 
	 * - The snake's body will have a length of 1 (a random position in the board)
	 * - The snake's food will be a random position in the board.
	 * - The direction parameter will be set to undefined.
	 * - The score, speed ticksm and paused properties will be assigned with their default values
	 * - All children of the scene (if any) will be removed.
	 * - The snake board will be created.
	 * - The display node will be creatd.
	 * 
	 * You can customize the game by modifying the parameters in this method.
	 */
	initialize() {
		this.pixelSize = 1; // The size of each "pixel" in the snake board
		this.rows = 15; // Board's number or rows
		this.columns = 20; // Board's number of columns
		this.emptyColor = 0xcccccc; // The color of a pixel when it's empty
		this.snakeColor = 0x008000; // The color of a pixel when it contains the snake's body
		this.foodColor = 0xd00000; // The color of a pixel when it contains the snake's food

		this.snake = [this._randomPosition()]; // Array containing the snake's positions. Initially it has a single (random) position
		this.food = this._randomPosition(); // The position of the snake's food
		this.direction = "right";
		this.score = 0; // The current score
		this.speed = 1; // The current speed
		this.ticks = 0; // This is a "ticks" counter. It gets incremented on each update
		this.paused = true;

		// Clear the scene by removing all of its children (if any)
		this.scene.removeAllChildren();

		// Helper function that creates and returns a "pixel" for the position defined by x and y.
		// A "pixel" is simply a static CircleNode but it can be changed to a RectangleNode if you prefer.
		const createPixel = (x, y) => {
			//const pixel = new physion.RectangleNode(this.pixelSize, this.pixelSize);
			const pixel = new physion.CircleNode(this.pixelSize / 2);
			pixel.setPosition({ x, y });
			pixel.bodyType = "static";
			pixel.fillColor = this.emptyColor;
			pixel.lineWidth = 0;
			pixel.name = `pixel_${x}_${y}`;
			return pixel;
		}

		// Generate the board
		for (let y = 0; y < this.rows; y++) {
			for (let x = 0; x < this.columns; x++) {
				this.scene.addChild(createPixel(x, y));
			}
		}

		// Create the "display"
		const boardWidth = this.columns * this.pixelSize;
		const boardHeight = this.rows * this.pixelSize;

		this.display = new physion.RectangleNode(boardWidth, this.pixelSize);
		this.display.setPosition({ x: (boardWidth - this.pixelSize) / 2, y: boardHeight + this.pixelSize });
		this.display.bodyType = "static";
		this.display.fillColor = 0x0;
		this.display.fontSize = 42;
		this.display.fontColor = 0x00ff00;
		this.scene.addChild(this.display);

		this.updateDisplay();

		// This will change the viewport's zoom level so that all of the Scene contents are shown.
		physion.root.zoomScene();

		physion.root.keyboardManager.clear();
	}

	/**
	 * The update method get called on each simulation step.
	 * This can be considered as the main game loop.
	 */
	update(delta) {

		if (!this.initialized) {
			this.initialize();
			this.initialized = true;
		}

		this.getInput();

		if (!this.paused) {
			const interval = 16 - this.speed;
			if (this.ticks++ % interval === 0) {
				this.updateSnake();
				this.checkCollision();
				this.updateBoard();
			}
		}

		this.updateDisplay();
	}

	getInput() {
		const km = physion.root.keyboardManager;

		if (km.isPressed(km.keycodes.LEFT_ARROW)) {
			this.direction = "left";
			this.paused = false;
		}

		if (km.isPressed(km.keycodes.UP_ARROW)) {
			this.direction = "up";
			this.paused = false;
		}

		if (km.isPressed(km.keycodes.RIGHT_ARROW)) {
			this.direction = "right";
			this.paused = false;
		}

		if (km.isPressed(km.keycodes.DOWN_ARROW)) {
			this.direction = "down";
			this.paused = false;
		}
	}

	updateSnake() {
		const head = { ...this.snake[0] };
		switch (this.direction) {
			case "up":
				head.y += 1;
				break;
			case "down":
				head.y -= 1;
				break;
			case "left":
				head.x -= 1;
				break;
			case "right":
				head.x += 1;
				break;
		}

		this.snake.unshift(head);

		if (head.x === this.food.x && head.y === this.food.y) {
			this.score += 10;
			this.speed++;
			if (this.speed > 10) {
				this.speed = 10;
			}
			this.food = this._randomEmptyPosition();
			this.updateDisplay();
		} else {
			this.snake.pop();
		}
	}

	checkCollision() {
		const head = this.snake[0];
		if (
			head.x < 0 || head.x >= this.columns ||
			head.y < 0 || head.y >= this.rows ||
			this.snake.slice(1).some((segment) => segment.x === head.x && segment.y === head.y)
		) {
			alert("Game Over!");
			this.initialize();
		}
	}

	updateBoard() {
		this.scene.children.filter(c => c.name.startsWith("pixel")).forEach(c => {
			c.fillColor = this.emptyColor;
			c.alpha = 0.75
		});

		this.snake.forEach(pos => {
			const pixel = this._getPixel(pos.x, pos.y);
			pixel.fillColor = this.snakeColor
			pixel.alpha = 1;
		});

		const foodPixel = this._getPixel(this.food.x, this.food.y);
		foodPixel.fillColor = this.foodColor;
		foodPixel.alpha = 1;
	}

	updateDisplay() {
		if (this.paused) {
			this.display.text = `🐍 SNAKE GAME 🐍               Start the simulation and press any arrow key to start the game`;
		} else {
			this.display.text = `🐍 SNAKE GAME 🐍               Score: ${this.score}   Speed: ${this.speed}`;
		}
	}

	/** Returns a random position on the board */
	_randomPosition() {
		const x = Math.floor(Math.random() * this.columns);
		const y = Math.floor(Math.random() * this.rows);
		return { x, y };
	}

	/** Returns a random, unoccupied position on the board */
	_randomEmptyPosition() {
		let p = this._randomPosition();
		const occupied = [...this.snake, this.food];
		while (occupied.find(o => o.x === p.x && o.y === p.y)) {
			p = this._randomPosition();
		}
		return p;
	}

	/** Returns the pixel at position x,y of the board */
	_getPixel(x, y) {
		const index = y * this.columns + x;
		return this.scene.children[index];
	}
}
