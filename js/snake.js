/**
 * @author loki 2010.12.24
 */
;
(function(){
    function Map(rows, cols){
        this.rows = rows;
        this.cols = cols;
    }
    Map.prototype = {
        create: function(){
            var frag = document.createDocumentFragment();
            var table = document.createElement("table");
            table.cellPadding = "0px";
            table.cellSpacing = "0px";
            for (var i = 0; i < this.rows; i++) {
                var tr = document.createElement("tr");
                for (var j = 0; j < this.cols; j++) {
                    var cell = document.createElement("td");
                    cell.className = "floor";
                    cell.id = "cell_" + j + "_" + i;
                    tr.appendChild(cell);
                }
                table.appendChild(tr);
            }
            frag.appendChild(table);
            gameContainer.appendChild(frag);
        },
        getCellByXY: function(x, y){
            return document.getElementById("cell_" + x + "_" + y);
        }
    };
    function Food(){
        this.x = 0;
        this.y = 0;
        this.onSnake = 0; // the food is generated on the snake body
    }
    Food.prototype.generate = function(){
        this.x = Math.floor(Math.random() * map.rows);
        this.y = Math.floor(Math.random() * map.cols);
        var cell = map.getCellByXY(this.x, this.y);
        if (cell.className == 'snake') {
            this.onSnake = 1;
        }
        cell.className = "food";
    };
    /**
     *
     * @param {Object} x
     * @param {Object} y
     * @param {Object} direct
     * @param {Object} len
     * @param {Object} speed
     */
    function Snake(x, y, direct, len, speed){
        var self = this;
        this.body = [];
        if (len < 3) {
            len = 3;
        }
        else 
            if (len > 5) {
                len = 5;
            }
        for (var i = 0; i < len; i++) {
            var tmp_x = x + direct.x * i;
            var tmp_y = y + direct.y * i;
            this.body.unshift({
                x: tmp_x,
                y: tmp_y
            });
            var cell = map.getCellByXY(tmp_x, tmp_y);
            cell.className = "snake";
        }
        if (this.speed < 1) {
            this.speed = 1;
        }
        else 
            if (this.speed > 10) {
                this.speed = 10;
            }
            else {
                this.speed = speed;
            }
        this.direct = direct;
        this.timer = null;
        if (this.timer == null) {
            this.resume();
        }
    }
    Snake.prototype = {
        move: function(){
            //console.debug(this.direct);
            var cell, head = this.body[0], newhead = {
                x: head.x + this.direct.x,
                y: head.y + this.direct.y
            };
            if (newhead.x < 0 || newhead.x > map.rows - 1 || newhead.y < 0 || newhead.y > map.cols - 1) {
                this.die();
                return false;
            }
            var len = this.body.length;
            for (var i = 0; i < len; i++) {
                var cell = this.body[i];
                if (newhead.x == cell.x && newhead.y == cell.y) { // check whether the snake hit his body
                    this.die();
                    return false;
                }
                cell.className = 'snake';
                if (i == 0) {
                    continue;
                }
                if (food.onSnake == 0) { // for the performance
                    continue;
                }
                var prev = this.body[i - 1];
                if (map.getCellByXY(prev.x, prev.y).className == 'food') {
                    cell.className = 'food';
                }
            }
            map.getCellByXY(newhead.x, newhead.y).className = "snake";
            this.body.unshift(newhead);
            if (food.x == newhead.x && food.y == newhead.y) {
                this.eat();
            }
            else {
                var tail = this.body[this.body.length - 1];
                cell = map.getCellByXY(tail.x, tail.y);
                if (cell.className == 'snake') { // if it is a food, then still show
                    cell.className = "floor";
                }
                this.body.pop();
            }
        },
        eat: function (){
            food.generate();
            score.add(score_per_food);
            score_panel.update(score.get());
        },
        changeDirect: function(e){
            var newdirect = direct.getByKeyCode(e.keyCode);
            // if the direction is available, then change the direction
            if (!newdirect) {
                return false;
            }
            if (newdirect.x == -this.direct.x && newdirect.y == this.direct.y) {
                return false;
            }
            else 
                if (newdirect.y == -this.direct.y && newdirect.x == this.direct.x) {
                    return false;
                }
            this.direct = newdirect;
        },
        stop: function(){
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
            }
        },
        resume: function(){
            var self = this;
            if (!self.timer) {
                self.timer = setInterval(function(){
                    self.move();
                }, 1000 / self.speed);
            }
        },
        die: function(){
            this.stop();
            alert('snake die.');
        }
    };
    function Direction(){
        this.direct = {
            37: {
                x: -1,
                y: 0
            },
            38: {
                x: 0,
                y: -1
            },
            39: {
                x: 1,
                y: 0
            },
            40: {
                x: 0,
                y: 1
            }
        };
    }
    Direction.prototype = {
        getByKeyCode: function(code){
            var direct = this.direct[code];
            //console.debug(direct);
            return direct;
        },
        getByRandom: function(){
            var key = Math.floor(Math.random() * 4 + 37);
            //console.debug(key);
            var result = this.direct[key];
            //console.debug(result);
            return result;
        }
    };
    function Score(){
        var self = this;
        self.score = 0;
    }
    Score.prototype = {
        add: function(score){
            var self = this;
            self.score += parseInt(score);
        },
        get: function (){
            return this.score;
        }
    };
    function ScorePanel(){
        var self = this;
        panel = document.getElementById("score"),
            frag = document.createDocumentFragment(),
            text = document.createTextNode("计分牌："),
            self.score = document.createTextNode("0");
        self.score.id = "score_value";
        frag.appendChild(text);
        frag.appendChild(self.score);
        panel.appendChild(frag);
    }
    ScorePanel.prototype = {
        update: function (score){
            var self = this;
            self.score.nodeValue = parseInt(score);
        }
    };
    function ControlPanel(){
        var map_text, map_select, map_select_option, map_select_option_text, speed_input, speed_text, length_input, length_text, start_button, stop_button, element_list = [], frag, table;
        
        map_text = document.createTextNode("地图大小：");
        map_select = document.createElement("select");
        map_select.id = "cp_map_select";
        for (var i = 0; i < map_size_hash.length; i++) {
            map_select_option = document.createElement("option");
            map_select_option.value = i;
            map_select_option.appendChild(document.createTextNode(map_size_hash[i]));
            map_select.appendChild(map_select_option);
        }
        
        speed_text = document.createTextNode("速度：(1-10)");
        speed_input = document.createElement("input");
        speed_input.type = "text";
        speed_input.value = snake_speed;
        speed_input.id = "cp_speed_input";
        speed_input.length = "10";
        
        length_text = document.createTextNode("长度：(3-5)");
        length_input = document.createElement("input");
        length_input.type = "text";
        length_input.value = snake_length;
        length_input.id = "cp_length_input";
        length_input.length = "10";
        
        start_button = document.createElement("input");
        start_button.type = "button";
        start_button.value = "开始";
        start_button.id = "cp_start_button";
        start_button.onclick = function(){
            start();
        };
        
        stop_button = document.createElement("input");
        stop_button.type = "button";
        stop_button.value = "暂停";
        stop_button.id = "cp_stop_button";
        stop_button.onclick = function(){
            stop();
        };
        
        element_list = [[map_text, map_select], [speed_text, speed_input], [length_text, length_input], [start_button, stop_button]];
        
        frag = document.createDocumentFragment();
        table = document.createElement("table");
        table.cellPadding = "0px";
        table.cellSpacing = "0px";
        for (var i = 0; i < 4; i++) {
            var tr = document.createElement("tr");
            for (var j = 0; j < 2; j++) {
                var td = document.createElement("td");
                td.appendChild(element_list[i][j]);
                tr.appendChild(td);
            }
            table.appendChild(tr);
        }
        frag.appendChild(table);
        document.getElementById("control").appendChild(frag);
    }
    function start(){
        score = new Score();
        score_panel.update(0);
        gameContainer.innerHTML = '';
        if (snake) {
            snake.stop();
        }
        snake = null;
        direct = new Direction();
        var map_width_height = map_size_hash[document.getElementById("cp_map_select").value].split("x");
        map_width = map_width_height[0];
        map_height = map_width_height[1];
        map = new Map(map_width, map_height);
        map.create();
        snake_length = document.getElementById("cp_length_input").value || snake_length;
        snake_speed = document.getElementById("cp_speed_input").value || snake_speed;
        x = Math.floor(Math.random() * (map_width - snake_length * 2) + parseInt(snake_length));
        y = Math.floor(Math.random() * (map_height - snake_length * 2) + parseInt(snake_length));
        snake = new Snake(x, y, direct.getByRandom(), snake_length, snake_speed);
        food = new Food();
        food.generate();
    }
    function stop(){
        if (game_stop == 0) {
            game_stop = 1;
        }
        else {
            game_stop = 0;
        }
        var stop_button = document.getElementById("cp_stop_button");
        if (game_stop == 1) {
            snake.stop();
            stop_button.value = '继续';
        }
        else {
            snake.resume();
            stop_button.value = '暂停';
        }
    }
    var snake, food, map_width = 30, map_height = 30, snake_length = 5, snake_speed = 10, score_per_food = 100, control_panel, score_panel, score, direct, map, snake, food, game_stop = 0, map_size_hash = ["30x30", "40x40", "50x50"], gameContainer = document.getElementById("game");
    score_panel = new ScorePanel();
    control_panel = new ControlPanel();
    start();
    document.onkeydown = function(e){
        snake.changeDirect(e);
    };
})();

