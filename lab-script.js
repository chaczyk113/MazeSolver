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
    var dirButtons = document.querySelectorAll('#solve-dir button');
    var btnStyles = ['wallState', 'pathState', 'startState', 'stopState', 'visitedState', 'wayState', 'actualState', 'semiWayState'];

    return {
        init: function () {

        },

        matrixCreate: function (width, height, btnSize) {
            matrixPlace = document.getElementById('matrix-place');
            this.matrixRemove(matrixPlace);
            matrixPlace.style.width = width * btnSize + 'px';
            matrixPlace.style.height = height * btnSize + 'px';
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

        setPlayButton: function (state) {
            var runButton = document.getElementById('run-algorithm');
            if (state === 'play') {
                runButton.innerHTML = '<i class="far fa-play-circle"></i>Run algorithm';
                runButton.classList.remove('button-pressed');
            } else if (state === 'pause') {
                runButton.innerHTML = '<i class="far fa-pause-circle"></i>Pause';
                runButton.classList.remove('button-pressed');
            }
            else if (state === 'paused') {
                runButton.classList.add('button-pressed');
            }
        },

        setDirButton: function (pressedBtn) {
            console.log(pressedBtn);
            console.log(dirButtons);
            dirButtons = Array.from(dirButtons);
            for (button of dirButtons) {
                button.classList.remove('button-pressed');
            }
            pressedBtn.classList.add('button-pressed');
        },

        updateResult: function (result) {
            document.getElementById("algorithm-last").innerText = result.algorithm;
            document.getElementById("visited-last").innerText = result.visited;
            document.getElementById("path-last").innerText = result.path[0];
            document.getElementById("algorithm-previous").innerText = result.previousAlgorithm;
            document.getElementById("visited-previous").innerText = result.previousVisited;
            document.getElementById("path-previous").innerText = result.previousPath[0];
        }
    }

})();

var solverController = (function (labCtrl, UICtrl) {
    var graph, solveLock, stop, search, counter, wayCounter, previousVisited, previousPath, algorithm, previousAlgorithm;

    solveLock = false;
    previousPath = [0, 0];
    previousVisited = 0;
    algorithm = "";
    previousAlgorithm = "";
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
            this.relators = [];
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

    NodeCreate.prototype.fillChildren = function (matrix, solveDir, stop) {
        var lX, lY, Xmax, Ymax, children;
        lX = this.location.x;
        lY = this.location.y;
        children = this.children;
        Ymax = matrix.length;
        Xmax = matrix[0].length;

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
            case 'A*': lookRight(); lookDown(); lookLeft(); lookUp(); break;
        }
        if (solveDir === 'A*') {
            children = children.sort(function (a, b) {
                return (Math.abs(a[0] - stop.x) + Math.abs(a[1] - stop.y)) - (Math.abs(b[0] - stop.x) + Math.abs(b[1] - stop.y))
            });
        }


    };
    NodeCreate.prototype.betterFillChildren = function (matrix, solveDir, stop) {
        var lX, lY, Xmax, Ymax, children;
        lX = this.location.x;
        lY = this.location.y;
        children = this.children;
        Ymax = matrix.length;
        Xmax = matrix[0].length;
        // console.log('node '+lX+' '+lY);
        // checks if next cell is inside the matrix, then checks if any child avaliable if it's not a wall (0) or previously visited (4)
        var lookRight = function () {
            if ((lX + 1 < Xmax) && (matrix[lY][lX + 1] > 0 && matrix[lY][lX + 1] < 4)) {
                var antecedents = [];
                children.push(lookDeeper(lX + 1, lY, lX, lY, antecedents));
                // matrix[lY][lX + 1] = 4;
            }
        }
        var lookDown = function () {
            if ((lY + 1 < Ymax) && (matrix[lY + 1][lX] > 0 && matrix[lY + 1][lX] < 4)) {
                var antecedents = [];
                children.push(lookDeeper(lX, lY + 1, lX, lY, antecedents));
                // matrix[lY + 1][lX] = 4;
            }
        }
        var lookLeft = function () {
            if ((lX - 1 >= 0) && (matrix[lY][lX - 1] > 0 && matrix[lY][lX - 1] < 4)) {
                var antecedents = [];
                children.push(lookDeeper(lX - 1, lY, lX, lY, antecedents));
                // matrix[lY][lX - 1] = 4;
            }
        }
        var lookUp = function () {
            if ((lY - 1 >= 0) && (matrix[lY - 1][lX] > 0 && matrix[lY - 1][lX] < 4)) {
                var antecedents = [];
                children.push(lookDeeper(lX, lY - 1, lX, lY, antecedents));
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
            case 'A*': lookRight(); lookDown(); lookLeft(); lookUp(); break;
        }
        if (solveDir === 'A*') {
            children = children.sort(function (a, b) {
                return (Math.abs(a[0] - stop.x) + Math.abs(a[1] - stop.y)) - (Math.abs(b[0] - stop.x) + Math.abs(b[1] - stop.y))
            });
        }
        // console.log(children);
        function lookDeeper(oX, oY, pX, pY, antecedents) {
            var counter, onlyX, onlyY;
            counter = 0
            onlyX = oX;
            onlyY = oY;
            if ((oX + 1 < Xmax) && matrix[oY][oX + 1] > 0 && (oX + 1 !== pX)) {
                counter++;
                onlyX = oX + 1;
            }
            if ((oY + 1 < Ymax) && (matrix[oY + 1][oX] > 0) && (oY + 1 !== pY)) {
                counter++;
                onlyY = oY + 1;
            }
            if ((oX - 1 >= 0) && (matrix[oY][oX - 1] > 0) && (oX - 1 !== pX)) {
                counter++;
                onlyX = oX - 1;
            }
            if ((oY - 1 >= 0) && (matrix[oY - 1][oX] > 0) && (oY - 1 !== pY)) {
                counter++;
                onlyY = oY - 1;
            }

            if (counter != 1) return [oX, oY, antecedents];
            else if (onlyX === stop.x && onlyY === stop.y) {
                antecedents.push([oX, oY]);
                return [onlyX, onlyY, antecedents];
            }
            else {
                antecedents.push([oX, oY]);
                return lookDeeper(onlyX, onlyY, oX, oY, antecedents);
            }
        }
    };

    NodeCreate.prototype.returnChild = function () {
        if (this.lastChild < this.children.length) {
            var x, y
            x = this.children[this.lastChild][0]
            y = this.children[this.lastChild][1]
            this.relators = this.children[this.lastChild][2];
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
    var GraphCreate = function (startX, startY, stopX, stopY, solveDir, solveMode) {
        this.start = {
            x: startX,
            y: startY
        }
        this.stop = {
            x: stopX,
            y: stopY
        }
        this.solveDir = solveDir;
        this.solveMode = solveMode;
        this.matrix = [],
            this.node = [],
            this.makeNode = function (nX, nY, pX, pY) {
                // node position in labirynth's matrix and it's parent's position

                this.node['n-' + nX + '-' + nY] = new NodeCreate(nX, nY, pX, pY);
                this.node['n-' + nX + '-' + nY].vectorCalc();

                if (this.matrix[nY][nX] === 1) {
                    UICtrl.btnState(nX, nY, 4);
                }

                this.matrix[nY][nX] = 4; // 4 means visited

                if (this.solveMode === 'optimised') {
                    this.node['n-' + nX + '-' + nY].betterFillChildren(this.matrix, this.solveDir, this.stop);
                } else {
                    this.node['n-' + nX + '-' + nY].fillChildren(this.matrix, this.solveDir, this.stop);
                }

                return this.node['n-' + nX + '-' + nY];
            },
            this.getChild = function (node) {
                return node.returnChild();
            }
    };

    function displayWay() {
        var keepDisplay, visitedNode, steps, middleSetps;
        steps = 0;
        middleSetps = 0;
        keepDisplay = true;
        visitedNode = graph.node['n-' + graph.stop.x + '-' + graph.stop.y]; //END node
        console.log(algorithm.split(" ")[0] );
        while (keepDisplay) {
            visitedNode = graph.node['n-' + visitedNode.parent.x + '-' + visitedNode.parent.y];
            steps++;
            if (visitedNode.location.x === graph.start.x && visitedNode.location.y === graph.start.y) {
                keepDisplay = false;
            }
            else {
                UICtrl.btnState(visitedNode.location.x, visitedNode.location.y, 5);
            }
            if (algorithm.split(" ")[0] != "BFS" && visitedNode.relators) {
                for (relator of visitedNode.relators) {
                    UICtrl.btnState(relator[0], relator[1], 7);
                    middleSetps++;
                }
            }
        }
        return [steps, steps + middleSetps];
    }

    function finisHIM(newNode) {
        UICtrl.toggleState(newNode.location.x, newNode.location.y, 'actualState');
        if (!stop) wayCounter = displayWay();
        appController.btnLock = false;
        UICtrl.setPlayButton('play');
        var result = {
            algorithm: algorithm,
            visited: counter,
            path: wayCounter,
            previousAlgorithm: previousAlgorithm,
            previousVisited: previousVisited,
            previousPath: previousPath
        }
        UICtrl.updateResult(result);
        previousPath = wayCounter;
        previousVisited = counter;
        previousAlgorithm = algorithm;
    }
    // DFS algorithm

    function dfsAlgorithm(delay, solveDir, runMode, optimisation, setAlgorithm) {
        var newNode, newChild, lab, previousNode;
        search = true; // we are still searching
        stop = false;
        solveLock = false;
        counter = 0;
        wayCounter = 0;
        algorithm = setAlgorithm + ' ' + optimisation + ' ' + solveDir;
        //amout of nodes visited
        lab = labCtrl.returnLab();
        // create new graph
        graph = new GraphCreate(lab.start.x, lab.start.y, lab.stop.x, lab.stop.y, solveDir, optimisation);
        //clone array:
        graph.matrix = lab.matrix.map(function (i) {
            return i.map(function (j) {
                return j;
            })
        })
        // create first - start node
        newNode = graph.makeNode(lab.start.x, lab.start.y, lab.start.x, lab.start.y);

        execution();

        function execution() {
            if (runMode === 'manual') solveLock = true;
            UICtrl.toggleState(newNode.location.x, newNode.location.y, 'actualState');
            newChild = graph.getChild(newNode);
            if (!graph.node.hasOwnProperty('n-' + newChild.x + '-' + newChild.y)) {
                if (newChild === false) {
                    // check if we came back to begining and there is no new way - if yes -> there's no way out
                    if (newNode.location.x === graph.start.x && newNode.location.y === graph.start.y) {
                        search = false;
                        stop = true; //means we should stop right NOW!!
                        appController.btnLock = false;
                        alert('Watch out! There is no way out!!')
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

                    if (search) {
                        if (solveLock) pauseWait();
                        else setTimeout(execution, delay);
                    }
                    else {
                        finisHIM(newNode);
                    }
                }
                else { search ? execution() : finisHIM(newNode); }
            }
            else {
                finisHIM(newNode);
            }
        }
        function pauseWait() {
            if (!stop) {
                if (solveLock) setTimeout(pauseWait, 300);
                else setTimeout(execution, delay);
            }
            else {
                finisHIM(newNode);
            }
        }
    }

    // BFS algorithm

    function bfsAlgorithm(delay, solveDir, runMode, optimisation, setAlgorithm) {
        var newNode, newChild, lab, stock, newStock;
        counter = 0;
        search = true; // we are still searching
        stop = false;
        solveLock = false;
        algorithm = setAlgorithm + ' ' + optimisation + ' ' + solveDir;
        lab = labCtrl.returnLab();
        stock = [];
        newStock = [];
        // create new graph
        // graph = new GraphCreate(lab.start.x, lab.start.y, lab.stop.x, lab.stop.y, solveDir, 'default');
        graph = new GraphCreate(lab.start.x, lab.start.y, lab.stop.x, lab.stop.y, solveDir, optimisation);
        //clone array:
        graph.matrix = lab.matrix.map(function (i) {
            return i.map(function (j) {
                return j;
            })
        })
        // create first - start node
        newNode = graph.makeNode(lab.start.x, lab.start.y, lab.start.x, lab.start.y);
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

                        newNode = graph.makeNode(newChild.x, newChild.y, stock[j].location.x, stock[j].location.y);
                        if (newNode.location.x === graph.stop.x && newNode.location.y === graph.stop.y) {
                            search = false;
                        }
                        newStock.push(newNode);
                        counter++;
                        if (delay > 0 || runMode === 'manual') {
                            UICtrl.toggleState(newNode.location.x, newNode.location.y, 'actualState', true);

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
                alert('Watch out! There is no way out!!')
            }
            if (!stop) {
                if (delay > 0) {
                    if (search) {
                        if (solveLock) pauseWait();
                        else setTimeout(execution, delay);
                    }
                    else {
                        finisHIM(newNode);
                    }
                }
                else search ? execution() : finisHIM(newNode);
            }
            else {
                finisHIM(newNode);
            }

        }
        function pauseWait() {
            if (!stop) {
                if (solveLock) setTimeout(pauseWait, 300);
                else setTimeout(execution, delay);
            }
            else {
                finisHIM(newNode);
            }
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
        graph = new GraphCreate(lab.start.x, lab.start.y, lab.stop.x, lab.stop.y, solveDir, 'default');
        //clone array:
        graph.matrix = lab.matrix.map(function (i) {
            return i.map(function (j) {
                return j;
            })
        })
        // create first - start node
        newNode = graph.makeNode(lab.start.x, lab.start.y, lab.start.x, lab.start.y);

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
    var labSize, defaultBtnSize, btnSize, btnLock, algorithm, runMode, delay, direction, optimisation, maxSize;
    labSize = 1;
    defaultBtnSize = 24;
    maxSize = 624;
    algorithm = 'DFS'; //as deafult solving method
    direction = 'right';
    runMode = 'auto';
    optimisation = 'default'
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
        var result = {
            visited: 0,
            path: [0, 0],
            previousVisited: 0,
            previousPath: [0, 0]
        }
        UICtrl.updateResult(result);
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

    function createLab(widthSet, heightSet, newBtnSize) {
        if (widthSet === undefined && heightSet === undefined) {
            width = parseInt(slider_w.value);
            height = parseInt(slider_h.value);
        }
        else {
            width = widthSet;
            height = heightSet;
        }
        if (newBtnSize === undefined) {

            newBtnSize = Math.round(100 * maxSize / width) / 100;
            console.log(newBtnSize);
            labSize = (Math.round(10 * newBtnSize / defaultBtnSize)) / 10;
            console.log(labSize);
            btnSize = newBtnSize;
            labCtrl.generateLab(width, height);
        }
        document.getElementById('matrix-place').style.width = width * newBtnSize + 'px';
        UICtrl.matrixCreate(width, height, newBtnSize);

    }

    function resizeLab(id) {
        if (id === 'size-down' && labSize > 0.5) {
            labSize -= 0.1;
            btnSize = labSize * defaultBtnSize;
        } else if (id === 'size-up' && width * (labSize + 0.1) * defaultBtnSize <= maxSize) {
            labSize += 0.1;
            btnSize = labSize * defaultBtnSize;
        }
        else if (id === 'size-up' && width * (labSize + 0.1) * defaultBtnSize > maxSize) {
            btnSize = Math.round(100 * maxSize / width) / 100;
            labSize = (Math.round(10 * btnSize / defaultBtnSize)) / 10;
        }
        console.log(btnSize);
        console.log(labSize);

        createLab(labCtrl.returnLab().width, labCtrl.returnLab().height, btnSize);
        console.log(document.getElementById('matrix-place').style.width);
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

    function displayInfo(algorithm) {
        var DFSinfo, BFSinfo, AstarInfo;
        DFSinfo = document.getElementById('DFS-des');
        BFSinfo = document.getElementById('BFS-des');
        AstarInfo = document.getElementById('Astar-des');

        DFSinfo.style.display = 'none';
        BFSinfo.style.display = 'none';
        AstarInfo.style.display = 'none';

        switch (algorithm) {
            case "DFS": {
                DFSinfo.style.display = 'block';
                break;
            }
            case "BFS": {
                BFSinfo.style.display = 'block';
                break;
            }
            case "A*": {
                AstarInfo.style.display = 'block';
                break;
            }
        }
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
                    displayInfo(algorithm);
                }
            });

            document.getElementById('solve-optimisation').addEventListener('click', function (event) {
                if (event.target.value) {
                    optimisation = event.target.value;
                }
            });

            document.getElementById('solve-dir').addEventListener('click', function (event) {
                if (appController.btnLock === false) {
                    if (event.target.value) {
                        direction = event.target.value;
                        UICtrl.setDirButton(event.target);
                    }
                    else if (event.target.parentNode.value) {
                        direction = event.target.parentNode.value;
                        UICtrl.setDirButton(event.target.parentNode);
                    }
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
                        UICtrl.setPlayButton('pause');
                        console.log(algorithm, direction, runMode, optimisation);
                        if (algorithm === 'DFS') solverCtrl.dfsStart(delay, direction, runMode, optimisation, "DFS");
                        else if (algorithm === 'A*') solverCtrl.dfsStart(delay, 'A*', runMode, optimisation, "A*");
                        else if (algorithm === 'BFS') solverCtrl.bfsStart(delay, direction, runMode, optimisation, "BFS");

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
