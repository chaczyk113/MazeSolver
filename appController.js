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
