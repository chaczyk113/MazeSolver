// general - mathematic logic controller
var labController = (function () {
    // labyrinth constructor fucntion
    var LabCreate = function (width, height) {
        this.width = width,
            this.height = height,
            this.start = {
                x: -1,  // -1 for undefind values
                y: -1
            },
            this.stop = {
                x: -1,
                y: -1
            },
            this.matrixGenerator = function () {
                h = parseInt(this.height);
                w = parseInt(this.width);
                this.matrix = new Array(h);
                for (var i = 0; i < h; i++) {
                    this.matrix[i] = new Array(w).fill(0);
                }
            },
            this.matrixRandomize = function () {
                // create random lab matrix base 0 - wall, 1 - path, -1 - can be both
                var startX, startY, stopX, stopY, isOK;
                isOK = true;
                h = this.height;
                w = this.width;

                var startPos = randomizeValue(0, 3);
                switch (startPos) {
                    case 0:
                        startX = randomizeValue(1, w - 2);
                        if (startX % 2 === 0) startX = startX - 1;
                        startY = 0;
                        stopX = randomizeValue(1, w - 2);
                        if (stopX % 2 === 0) stopX = stopX - 1;
                        stopY = h - 1;
                        break;
                    case 1:
                        startX = randomizeValue(1, w - 2);
                        if (startX % 2 === 0) startX = startX - 1;
                        startY = h - 1;
                        stopX = randomizeValue(1, w - 2);
                        if (stopX % 2 === 0) stopX = stopX - 1;
                        stopY = 0;
                        break;
                    case 2:
                        startY = randomizeValue(1, h - 2);
                        if (startY % 2 === 0) startY = startY - 1;
                        startX = 0;
                        stopY = randomizeValue(1, h - 2);
                        if (stopY % 2 === 0) stopY = stopY - 1;
                        stopX = w - 1;
                        break;
                    case 3:
                        startY = randomizeValue(1, h - 2);
                        if (startY % 2 === 0) startY = startY - 1;
                        startX = w - 1;
                        stopY = randomizeValue(1, h - 2);
                        if (stopY % 2 === 0) stopY = stopY - 1;
                        stopX = 0;
                        break;
                }
                this.matrix[startY][startX] = 2;
                this.matrix[stopY][stopX] = 3;
                this.start.x = startX;
                this.start.y = startY;
                this.stop.y = stopY;
                this.stop.x = stopX;

                while (isOK) {
                    for (var y = 1; y < h - 1; y++) {
                        for (var x = 1; x < w - 1; x++) {
                            if (y % 2 > 0) {
                                if (x % 2 > 0) {
                                    this.matrix[y][x] = 1;
                                }
                                else {
                                    if (Math.random() > 0.45) this.matrix[y][x] = 1;
                                    else this.matrix[y][x] = 0;
                                }
                            }
                            else {
                                if (x % 2 > 0) {
                                    if (Math.random() > 0.45) this.matrix[y][x] = 1;
                                    else this.matrix[y][x] = 0;
                                }
                                else {
                                    this.matrix[y][x] = 0;
                                }
                            }
                        }
                    }
                    isOK = solverController.labTest();
                }

            }
    }

    function randomizeValue(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function isBorder(x, y, lab) //simply check if cell is in matrix's border
    {
        return (x === 0 || x === lab.width - 1 || y === 0 || y === lab.height - 1);
    }

    function isCorner(x, y, lab) //simply check if cell is in matri'x corner
    {
        return ((x === 0 && y === 0) || (x === 0 && y === lab.height - 1) || (x === lab.width - 1 && y === 0) || x === lab.width - 1 && (y === lab.height - 1));
    };


    var labyrinth;

    return {
        generateLab: function (w, h) {
            labyrinth = new LabCreate(w, h);
            labyrinth.matrixGenerator();
        },

        saveState: function (x, y) {
            var fieldState;
            filed = labyrinth.matrix;
            fieldState = filed[y][x];

            // states: 0 - wall, 1 - path, 2 - start, 3 - stop
            // there can be only one start and stop, we can't make a path's on labyrinth contour and set start/stop on corners
            if (fieldState === 0 && !isBorder(x, y, labyrinth)) {
                filed[y][x] = 1;
            }
            else if (fieldState === 0 && isBorder(x, y, labyrinth) && !isCorner(x, y, labyrinth)) {

                if (labyrinth.start.x < 0) { // when labyrinth start position is empty
                    filed[y][x] = 2;
                    labyrinth.start.x = x;
                    labyrinth.start.y = y;
                }
                else if (labyrinth.stop.x < 0) { // when labyrinth stop position is empty
                    filed[y][x] = 3;
                    labyrinth.stop.x = x;
                    labyrinth.stop.y = y;
                }
            }
            else if (fieldState === 1) {
                if (labyrinth.start.x < 0) { // when labyrinth start position is empty
                    filed[y][x] = 2;
                    labyrinth.start.x = x;
                    labyrinth.start.y = y;
                }
                else if (labyrinth.stop.x < 0) { // when labyrinth stop position is empty
                    filed[y][x] = 3;
                    labyrinth.stop.x = x;
                    labyrinth.stop.y = y;
                }
                else {
                    filed[y][x] = 0;
                }
            }
            else if (fieldState === 2) {
                if (!labyrinth.stop.y) { // when labyrinth stop position is empty
                    filed[y][x] = 3;
                    labyrinth.stop.x = x;
                    labyrinth.stop.y = y;
                }
                else {
                    filed[y][x] = 0;
                }
                labyrinth.start.x = -1;
                labyrinth.start.y = -1;
            }
            else if (fieldState === 3) {
                filed[y][x] = 0;
                labyrinth.stop.x = -1;
                labyrinth.stop.y = -1;
            }
            return filed[y][x];
        },

        returnLab: function () {
            return labyrinth;
        },
        // labyrinth: labyrinth, ??!??!?!
    }

})();

// User Interface controller
var UIController = (function () {
    var matrixPlace;

    var btnStyles = ['wallState', 'pathState', 'startState', 'stopState', 'visitedState', 'wayState', 'actualState'];

    return {
        init: function () {

        },

        matrixCreate: function (width, height, btnSize) {
            matrixPlace = document.getElementById('matrix-place');
            this.matrixRemove(matrixPlace);
            for (var y = 0; y < height; y++) {
                for (var x = 0; x < width; x++) {
                    var btn = document.createElement("BUTTON");
                    btn.setAttribute("id", 'btn-' + x + '-' + y);
                    btn.setAttribute("class", 'matrixBtn');
                    matrixPlace.appendChild(btn);
                    btn.style.width = btnSize + 'px';
                    btn.style.height = btnSize + 'px';
                    btn.style.fontSize = 0.8 * btnSize + 'px';
                    // document.getElementById('btn-' + x + '-' + y).innerHTML = '';
                }
            }
        },

        matrixRemove: function (matrixPlace) {
            // matrixPlace = document.getElementById('matrix-place');
            for (var i = matrixPlace.childNodes.length; i > 0; i--) {
                matrixPlace.removeChild(matrixPlace.childNodes[i - 1]);
            }
        },

        btnState: function (x, y, btnState) {
            var pressedBtn = document.getElementById('btn-' + x + '-' + y);
            // just in case clear all styles - wallStyle is deafult

            for (var state of btnStyles) {
                pressedBtn.classList.remove(state);
            }
            if (typeof (btnState) !== undefined) pressedBtn.classList.add(btnStyles[btnState]);

        },

        toggleState: function (x, y, btnState, adding) {
            var pressedBtn = document.getElementById('btn-' + x + '-' + y);
            if (adding) {
                pressedBtn.classList.add(btnState);
            }
            else {
                pressedBtn.classList.remove(btnState);
            }

        },

        displayArrow: function (x, y, dir, opacity) {
            var arrow, color
            if (dir !== '') {
                arrow = '<i class="fas fa-angle-' + dir + '"></i>' //template string
            }
            else {
                arrow = dir;
            }
            color = 'rgba(51, 51, 51, ' + opacity + ')';

            document.getElementById('btn-' + x + '-' + y).innerHTML = arrow;
            document.getElementById('btn-' + x + '-' + y).style.color = color;
        },

        setPlayButton: function (state) {
            var runButton = document.getElementById('run-algorithm');
            if (state === 'play') {
                runButton.innerHTML = '<i class="far fa-play-circle"></i>Run algorithm';
                runButton.classList.remove('button-pressed');
            } else if (state === 'pause')  {
                runButton.innerHTML = '<i class="far fa-pause-circle"></i>Pause';
                runButton.classList.remove('button-pressed');
            }
            else if (state === 'paused') {
                runButton.classList.add('button-pressed');
            }
        }
    }

})();


var solverController = (function (labCtrl, UICtrl) {
    var graph, solveLock, stop, search, arrowsArray;;

    solveLock = false;
    // graph's node constructor
    var NodeCreate = function (lX, lY, pX, pY) {
        this.location = {
            x: lX,
            y: lY
        },
            this.parent = {
                x: pX,
                y: pY
            },
            this.vector = undefined,
            this.children = [],
            this.lastChild = 0 //when any child visited yet
    };

    NodeCreate.prototype.vectorCalc = function () {
        if (this.parent.x > this.location.x) this.vector = 'left';
        else if (this.parent.x < this.location.x) this.vector = 'right';
        else if (this.parent.y > this.location.y) this.vector = 'up';
        else if (this.parent.y < this.location.y) this.vector = 'down';
        else this.vector = 'up';
    };

    NodeCreate.prototype.fillChildren = function (matrix, solveDir) {
        var lX, lY, Xmax, Ymax, children;
        lX = this.location.x;
        lY = this.location.y;
        children = this.children;
        Ymax = matrix.length;
        Xmax = matrix[0].length;
        // THIS SHOULD DEPENDS ON VECTOR BUT NOT YET :))
        // checks if next cell is inside the matrix, then checks if any child avaliable if it's not a wall (0) or previously visited (4)
        var lookRight = function () {
            if ((lX + 1 < Xmax) && (matrix[lY][lX + 1] > 0 && matrix[lY][lX + 1] < 4)) {
                children.push([lX + 1, lY]);
                // matrix[lY][lX + 1] = 4;
            }
        }
        var lookDown = function () {
            if ((lY + 1 < Ymax) && (matrix[lY + 1][lX] > 0 && matrix[lY + 1][lX] < 4)) {
                children.push([lX, lY + 1]);
                // matrix[lY + 1][lX] = 4;
            }
        }
        var lookLeft = function () {
            if ((lX - 1 >= 0) && (matrix[lY][lX - 1] > 0 && matrix[lY][lX - 1] < 4)) {
                children.push([lX - 1, lY]);
                // matrix[lY][lX - 1] = 4;
            }
        }
        var lookUp = function () {
            if ((lY - 1 >= 0) && (matrix[lY - 1][lX] > 0 && matrix[lY - 1][lX] < 4)) {
                children.push([lX, lY - 1]);
                // matrix[lY - 1][lX] = 4;
            }
        }

        // we can change the order of children searching

        if (solveDir === 'rightHand') {
            solveDir = 'rh-' + this.vector;
        } else if (solveDir === 'leftHand') {
            solveDir = 'lh-' + this.vector;
        }
        // quite messy below - I know :(
        switch (solveDir) {
            case 'right': lookRight(); lookDown(); lookLeft(); lookUp(); break;
            case 'down': lookDown(); lookLeft(); lookUp(); lookRight(); break;
            case 'left': lookLeft(); lookUp(); lookRight(); lookDown(); break;
            case 'up': lookUp(); lookRight(); lookDown(); lookLeft(); break;
            case 'rh-right': lookDown(); lookRight(); lookUp(); lookLeft(); break;
            case 'rh-down': lookLeft(); lookDown(); lookRight(); lookUp(); break;
            case 'rh-left': lookUp(); lookLeft(); lookDown(); lookRight(); break;
            case 'rh-up': lookRight(); lookUp(); lookLeft(); lookDown(); break;
            case 'lh-right': lookUp(); lookDown(); lookRight(); lookLeft(); break;
            case 'lh-down': lookRight(); lookDown(); lookLeft(); lookUp(); break;
            case 'lh-left': lookDown(); lookLeft(); lookUp(); lookRight(); break;
            case 'lh-up': lookLeft(); lookUp(); lookRight(); lookDown(); break;
        }

    };

    NodeCreate.prototype.returnChild = function () {
        if (this.lastChild < this.children.length) {
            var x, y
            x = this.children[this.lastChild][0]
            y = this.children[this.lastChild][1]
            this.lastChild++;
            return {
                x: x,
                y: y
            };
        }
        else {
            return false;
        }
    }

    // empty graph's constructor to store nodes
    var GraphCreate = function (startX, startY, stopX, stopY) {
        this.start = {
            x: startX,
            y: startY
        }
        this.stop = {
            x: stopX,
            y: stopY
        }
        this.matrix = [],
            this.node = [],
            this.makeNode = function (nX, nY, pX, pY, solveDir) {
                // node position in labirynth's matrix and it's parent's position

                this.node['n-' + nX + '-' + nY] = new NodeCreate(nX, nY, pX, pY);
                this.node['n-' + nX + '-' + nY].vectorCalc();
                this.node['n-' + nX + '-' + nY].fillChildren(this.matrix, solveDir);
                if (this.matrix[nY][nX] === 1) {
                    UICtrl.btnState(nX, nY, 4);
                }
                this.matrix[nY][nX] = 4; // 4 means visited

                return this.node['n-' + nX + '-' + nY];
            },
            this.getChild = function (node) {
                return node.returnChild();
            }
    };

    var ArrowCreate = function (x, y, dir) {
        this.x = x,
            this.y = y,
            this.dir = dir
    }

    // just a fancy decoration adds arrow depenting od direction where we're movig
    function findArrow(newNode, previousNode) {
        if (previousNode.location.x > newNode.location.x) return 'left';
        else if (previousNode.location.x < newNode.location.x) return 'right';
        else if (previousNode.location.y > newNode.location.y) return 'up';
        else if (previousNode.location.y < newNode.location.y) return 'down';
    }

    function arrowShadow(arrowsArray, draw) {
        if (draw) {
            for (var i = 0; i < arrowsArray.length; i++) {
                UICtrl.displayArrow(arrowsArray[i].x, arrowsArray[i].y, arrowsArray[i].dir, 1 / (i + 1));
            }
        }
        else {
            for (var i = 0; i < arrowsArray.length; i++) {
                UICtrl.displayArrow(arrowsArray[i].x, arrowsArray[i].y, '', 1);
            }
        }
    }

    function displayWay() {
        var keepDisplay, visitedNode, counter;
        counter = 0;
        keepDisplay = true;
        visitedNode = graph.node['n-' + graph.stop.x + '-' + graph.stop.y]; //END node

        while (keepDisplay) {
            visitedNode = graph.node['n-' + visitedNode.parent.x + '-' + visitedNode.parent.y];
            counter++;
            if (visitedNode.location.x === graph.start.x && visitedNode.location.y === graph.start.y) {
                keepDisplay = false;
            }
            else {
                UICtrl.btnState(visitedNode.location.x, visitedNode.location.y, 5);
            }
        }
        return counter;
    }

    // DFS algorithm

    function dfsAlgorithm(delay, solveDir, runMode) {
        var newNode, newChild, lab, previousNode, counter, wayCounter;
        search = true; // we are still searching
        stop = false;
        solveLock = false;
        counter = 0;
        wayCounter = 0;
        //amout of nodes visited
        lab = labCtrl.returnLab();
        arrowsArray = [];
        // create new graph
        graph = new GraphCreate(lab.start.x, lab.start.y, lab.stop.x, lab.stop.y);
        //clone array:
        graph.matrix = lab.matrix.map(function (i) {
            return i.map(function (j) {
                return j;
            })
        })
        // create first - start node
        newNode = graph.makeNode(lab.start.x, lab.start.y, lab.start.x, lab.start.y, solveDir);

        execution();

        return {
            visitedCells: counter,
            wayCells: wayCounter,
        };

        function execution() {
            if (runMode === 'manual') solveLock = true;
            UICtrl.toggleState(newNode.location.x, newNode.location.y, 'actualState');
            arrowShadow(arrowsArray, false);

            newChild = graph.getChild(newNode);
            if (!graph.node.hasOwnProperty('n-' + newChild.x + '-' + newChild.y)) {
                if (newChild === false) {
                    // check if we came back to begining and there is no new way - if yes -> there's no way out
                    if (newNode.location.x === graph.start.x && newNode.location.y === graph.start.y) {
                        search = false;
                        stop = true; //means we should stop right NOW!!
                        appController.btnLock = false;
                        alert('Bitch! There is no way out!!')
                    }
                    previousNode = newNode;
                    newNode = graph.node['n-' + newNode.parent.x + '-' + newNode.parent.y]; //coming back

                }
                else {
                    previousNode = newNode;
                    newNode = graph.makeNode(newChild.x, newChild.y, newNode.location.x, newNode.location.y, solveDir);
                    if (newNode.location.x === graph.stop.x && newNode.location.y === graph.stop.y) {
                        search = false;
                    }
                    counter++; // we make new node so we add counter
                }
            }
            if (!stop) {
                if (delay > 0 || runMode === 'manual') {
                    UICtrl.toggleState(newNode.location.x, newNode.location.y, 'actualState', true);
                    arrowsArray.unshift(new ArrowCreate(newNode.location.x, newNode.location.y, findArrow(newNode, previousNode)));

                    if (arrowsArray.length > 4) {
                        arrowsArray.pop();
                    }
                    arrowShadow(arrowsArray, true);
                    if (search) {
                        if (solveLock) pauseWait();
                        else setTimeout(execution, delay);
                    }
                    else {
                        finisHIM();
                    }
                }
                else { search ? execution() : finisHIM(); }
            }
            else {
                finisHIM();
            }
        }
        function pauseWait() {
            if (!stop) {
                if (solveLock) setTimeout(pauseWait, 300);
                else setTimeout(execution, delay);
            }
            else {
                finisHIM();
            }
        }
        function finisHIM() {
            UICtrl.toggleState(newNode.location.x, newNode.location.y, 'actualState');
            arrowShadow(arrowsArray, false);
            if (!stop) wayCounter = displayWay();
            appController.btnLock = false;
            UICtrl.setPlayButton('play');
            console.log(counter);
            console.log(wayCounter);
        }
    }

    // BFS algorithm

    function bfsAlgorithm(delay, solveDir, runMode) {
        var newNode, newChild, lab, stock, newStock, counter, wayCounter;
        counter = 0;
        search = true; // we are still searching
        stop = false;
        solveLock = false;
        lab = labCtrl.returnLab();
        arrowsArray = [];
        stock = [];
        newStock = [];
        // create new graph
        graph = new GraphCreate(lab.start.x, lab.start.y, lab.stop.x, lab.stop.y);
        //clone array:
        graph.matrix = lab.matrix.map(function (i) {
            return i.map(function (j) {
                return j;
            })
        })
        // create first - start node
        newNode = graph.makeNode(lab.start.x, lab.start.y, lab.start.x, lab.start.y, solveDir);
        stock.push(newNode);
        var j = 0;
        var i = 0;
        execution();
        function execution() {

            if (j < stock.length) {
                if (i < stock[j].children.length) {
                    newChild = graph.getChild(stock[j]);
                    // check if we already have this node
                    if (!graph.node.hasOwnProperty('n-' + newChild.x + '-' + newChild.y)) {
                        if (runMode === 'manual') solveLock = true;
                        UICtrl.toggleState(newNode.location.x, newNode.location.y, 'actualState');
                        arrowShadow(arrowsArray, false);
                        newNode = graph.makeNode(newChild.x, newChild.y, stock[j].location.x, stock[j].location.y, solveDir);
                        if (newNode.location.x === graph.stop.x && newNode.location.y === graph.stop.y) {
                            search = false;
                        }
                        newStock.push(newNode);
                        counter++;
                        if (delay > 0 || runMode === 'manual') {
                            UICtrl.toggleState(newNode.location.x, newNode.location.y, 'actualState', true);
                            arrowsArray.unshift(new ArrowCreate(newNode.location.x, newNode.location.y, newNode.vector));
                            if (arrowsArray.length > 5) {
                                arrowsArray.pop();
                            }
                            arrowShadow(arrowsArray, true);
                            // await timer(delay);
                        }
                    }
                    i++;
                }
                else {
                    i = 0;
                    j++;
                }
            } else {
                j = 0;
                stock = newStock.splice(0, newStock.length);
            }
            if (stock.length === 0) {
                search = false;
                stop = true; //means we should stop right NOW!!
                appController.btnLock = false;
                alert('Bitch! There is no way out!!')
            }
            if (!stop) {
                if (delay > 0) {
                    if (search) {
                        if (solveLock) pauseWait();
                        else setTimeout(execution, delay);
                    }
                    else {
                        finisHIM();
                    }
                }
                else search ? execution() : finisHIM();
            }
            else {
                finisHIM();
            }

        }
        function pauseWait() {
            if (!stop) {
                if (solveLock) setTimeout(pauseWait, 300);
                else setTimeout(execution, delay);
            }
            else {
                finisHIM();
            }
        }
        function finisHIM() {
            UICtrl.toggleState(newNode.location.x, newNode.location.y, 'actualState');
            arrowShadow(arrowsArray, false);
            if (!stop) wayCounter = displayWay();
            appController.btnLock = false;
            UICtrl.setPlayButton('play');
            console.log(counter);
            console.log(wayCounter);
        }
    }

    // Lightweight DFS algorithm to test if random graph has exit
    function labTester() {
        var newNode, search, newChild, lab, solveDir;
        solveDir = 'right';
        search = true; // we are still searching
        stop = false;
        lab = labCtrl.returnLab();
        // create new graph
        graph = new GraphCreate(lab.start.x, lab.start.y, lab.stop.x, lab.stop.y);
        //clone array:
        graph.matrix = lab.matrix.map(function (i) {
            return i.map(function (j) {
                return j;
            })
        })
        // create first - start node
        newNode = graph.makeNode(lab.start.x, lab.start.y, lab.start.x, lab.start.y, solveDir);

        while (search) {
            newChild = graph.getChild(newNode);
            if (newChild === false) {
                // check if we came back to begining and there is no new way - if yes -> there's no way out
                if (newNode.location.x === graph.start.x && newNode.location.y === graph.start.y) {
                    search = false;
                    stop = true;
                }
                previousNode = newNode;
                newNode = graph.node['n-' + newNode.parent.x + '-' + newNode.parent.y]; //coming back
            }
            else {
                previousNode = newNode;
                newNode = graph.makeNode(newChild.x, newChild.y, newNode.location.x, newNode.location.y, solveDir);
                if (newNode.location.x === graph.stop.x && newNode.location.y === graph.stop.y) {
                    search = false;
                }
            }
        }
        return stop;
    }

    return {
        initializeGraph: function () {
            var lab = labCtrl.returnLab();
            // create new graph
            graph = new GraphCreate(lab.start.x, lab.start.y, lab.stop.x, lab.stop.y);
            // create first - start node
            graph.makeNode(lab.start.x, lab.start.y, lab.start.x, lab.start.y);
        },
        dfsStart: dfsAlgorithm,
        bfsStart: bfsAlgorithm,
        labTest: labTester,
        setSolveLock: function () {
            solveLock = !solveLock;
            if (solveLock) UICtrl.setPlayButton('paused');
            else UICtrl.setPlayButton('pause');
        },
        getSolveLock: function () {
            return solveLock;
        },
        // solveLock
        arrows: function () {
            return arrowsArray;
        },
        stopExecution: function () {
            stop = true;
            search = false;
            appController.btnLock = false;
        },
        returnGraph: function () {
            return graph;
        },

    }
})(labController, UIController);


// Comunication with UI and logic
var appController = (function (labCtrl, UICtrl, solverCtrl) {
    var labSize, defaultBtnSize, btnSize, btnLock, algorithm, runMode, delay;
    labSize = 1;
    defaultBtnSize = 24;
    algorithm = 'DFS'; //as deafult solving method
    runMode = 'auto';
    btnSize = defaultBtnSize;
    btnLock = false;

    var slider_w = document.getElementById("width");
    var output_w = document.getElementById("width-val");
    var slider_h = document.getElementById("height");
    var output_h = document.getElementById("height-val");
    var slider_delay = document.getElementById("preview-speed'");
    var output_delay = document.getElementById("dealy-val");


    initSliders();

    slider_w.oninput = function () {
        output_w.innerHTML = 'width: ' + this.value;
    }

    slider_h.oninput = function () {
        output_h.innerHTML = 'height: ' + this.value;
    }

    slider_delay.oninput = function () {
        delayCalcuclate(parseInt(this.value));
        output_delay.innerHTML = 'delay: ' + delay + ' ms';
    }

    function initSliders() {
        output_w.innerHTML = 'width: ' + slider_w.value;
        output_h.innerHTML = 'height: ' + slider_h.value;
        delayCalcuclate(parseInt(slider_delay.value));
        output_delay.innerHTML = 'delay: ' + delay + ' ms';

    }

    var init = function () {
        appController.addListeners();
        createLab(slider_w.value, slider_h.value);
        labCtrl.returnLab().matrixRandomize();
        clearLab();
    };

    function delayCalcuclate(val) {
        switch (val) {
            case 0:
                delay = 0;
                break;
            case 1:
                delay = 10;
                break;
            case 2:
                delay = 100;
                break;
            case 3:
                delay = 250;
                break;
            case 4:
                delay = 500;
                break;
            case 5:
                delay = 1000;
                break;
        }
    }

    function clearLab(matrix) {
        var lab, state;
        lab = labCtrl.returnLab();

        if (typeof (matrix) === 'undefined') {
            matrix = lab.matrix;
        }

        for (var y = 0; y < lab.height; y++) {
            for (var x = 0; x < lab.width; x++) {
                state = matrix[y][x];
                UICtrl.btnState(x, y, state);
            }
        }
    }

    function createLab(width, height, newBtnSize) {
        if (width === undefined && height === undefined) {
            width = parseInt(slider_w.value);
            height = parseInt(slider_h.value);
        }
        if (newBtnSize === undefined) {

            if (height < 10) {
                labSize = 1.5;
                newBtnSize = labSize * defaultBtnSize;
            }
            else if (height <= 20) {
                labSize = 1.25;
                newBtnSize = labSize * defaultBtnSize;
            }
            else if (height <= 30) {
                labSize = 1;
                newBtnSize = labSize * defaultBtnSize;
            }
            else if (height <= 40) {
                labSize = 0.75;
                newBtnSize = labSize * defaultBtnSize;
            }
            else {
                labSize = 0.5;
                newBtnSize = labSize * defaultBtnSize;;
            }
            btnSize = newBtnSize;
            labCtrl.generateLab(width, height);
        }
        document.getElementById('matrix-place').style.width = width * newBtnSize + 'px';
        UICtrl.matrixCreate(width, height, newBtnSize);

    }

    function resizeLab(id) {
        if (id === 'size-down' && labSize > 0.5) {
            labSize -= 0.25;
            btnSize = labSize * defaultBtnSize;
            console.log('clicked minus');
        } else if (id === 'size-up' && labSize < 1.5) {
            labSize += 0.25;
            btnSize = labSize * defaultBtnSize;
            console.log('clicked plus');
        }

        createLab(labCtrl.returnLab().width, labCtrl.returnLab().height, btnSize);
        clearLab();
    }

    function showCooridnates() {
        var id, x, y;
        id = event.target.id;
        x = parseInt(id.split("-")[1]);
        y = parseInt(id.split("-")[2]);
        document.getElementById('show-btn-id').innerHTML = 'x: ' + x + ' y: ' + y;
    }

    function stateChange() {
        var id, x, y, fieldState;
        id = event.target.id;
        x = parseInt(id.split("-")[1]);
        y = parseInt(id.split("-")[2]);
        // sets clicked button state in labControler then passes it to UTcontroler
        fieldState = labCtrl.saveState(x, y);
        UICtrl.btnState(x, y, fieldState);
    }

    return {
        addListeners: function () {
            document.body.addEventListener('mousedown', function () {
                appController.mouseDown = true;
            });

            document.body.addEventListener('mouseup', function () {
                appController.mouseDown = false;
            });

            document.getElementById('matrix-place').addEventListener('mouseover', function (event) {
                showCooridnates();
                if (appController.mouseDown && appController.btnLock === false) {
                    stateChange();
                }
            });
            document.getElementById('matrix-place').addEventListener('mousedown', function (event) {
                if (appController.btnLock === false) {
                    stateChange();
                }
            });
            document.getElementById('matrix-wrapper').addEventListener('click', function (event) {
                if (appController.btnLock === true && runMode === 'manual') {
                    solverCtrl.setSolveLock();
                }
            });
            document.getElementById('new-board').addEventListener('click', function () {
                if (appController.btnLock === false) {
                    createLab();
                }
            });

            document.getElementById('random-lab').addEventListener('click', function () {
                if (appController.btnLock === false) {
                    createLab();
                    labCtrl.returnLab().matrixRandomize();
                    clearLab();
                }
            });

            document.getElementById('clear-solution').addEventListener('click', function () {
                if (appController.btnLock === false) {
                    clearLab();
                }
            });
            document.getElementById('stop-execution').addEventListener('click', function () {
                solverCtrl.stopExecution();
                appController.btnLock = false;
                UICtrl.setPlayButton('play');
            });

            document.getElementById('size-down').addEventListener('click', function (event) {
                if (appController.btnLock === false) {
                    resizeLab('size-down');
                }
            });

            document.getElementById('size-up').addEventListener('click', function (event) {
                if (appController.btnLock === false) {
                    resizeLab('size-up');
                }
            });

            document.getElementById('solve-algorithm').addEventListener('click', function (event) {
                if (event.target.value) {
                    algorithm = event.target.value;
                }
            });

            document.getElementById('mode-select').addEventListener('click', function (event) {
                if (event.target.value) {
                    runMode = event.target.value;
                }
            });

            document.getElementById('save-lab').addEventListener('click', function () {

                if (typeof (Storage) !== "undefined") {
                    localStorage.setItem('savedLab', JSON.stringify(labCtrl.returnLab()));
                    console.log('saved');
                }
            });

            document.getElementById('restore-lab').addEventListener('click', function () {

                if (typeof (Storage) !== "undefined") {
                    if (localStorage.savedLab) {
                        var savedLab = JSON.parse(localStorage.getItem('savedLab'));
                        createLab(savedLab.width, savedLab.height);
                        var lab = labCtrl.returnLab();

                        lab.height = savedLab.height;
                        lab.width = savedLab.width;
                        slider_w.value = savedLab.width;
                        slider_h.value = savedLab.height;
                        initSliders();
                        lab.matrix = savedLab.matrix;
                        lab.start.x = savedLab.start.x;
                        lab.start.y = savedLab.start.y;
                        lab.stop.x = savedLab.stop.x;
                        lab.stop.y = savedLab.stop.y;

                        clearLab(lab.matrix);
                        console.log('restored');
                    }

                }
            });

            document.getElementById('run-algorithm').addEventListener('click', function () {
                if (appController.btnLock === false) {
                    if (labCtrl.returnLab().start.x >= 0 && labCtrl.returnLab().stop.x >= 0) {
                        appController.btnLock = true; // we set lock here and finished function unlock it
                        clearLab();
                        var direction = document.getElementById('solve-direction').value;
                        UICtrl.setPlayButton('pause');
                        if (algorithm === 'DFS') solverCtrl.dfsStart(delay, direction, runMode);
                        else if (algorithm === 'BFS') solverCtrl.bfsStart(delay, direction, runMode);

                    }
                    else {
                        alert('You must setup start and end position first');
                    }
                } else {
                    solverCtrl.setSolveLock();
                }
            });
        },
        mouseDown: false,
        init: init,
        btnLock: btnLock
    }
})(labController, UIController, solverController);

appController.init();
