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
