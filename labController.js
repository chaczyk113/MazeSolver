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