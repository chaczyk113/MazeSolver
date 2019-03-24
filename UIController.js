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