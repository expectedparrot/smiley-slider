(function (global) {
    "use strict";

    function SmileySlider(container, imageSource) {
        if (!(container instanceof Element)) {
            throw new TypeError("SmileySlider requires a container element");
        }

        var image = imageSource || "smiley-slider.png";
        var width = 329;
        var height = 37;
        var headWidth = 40;
        var value = 0.5;
        var onChange = null;

        var base = element("div", {
            position: "relative",
            width: "100%",
            maxWidth: width + "px",
            height: height + "px",
            margin: "0 auto",
            background: "white"
        });

        var track = element("div", {
            position: "absolute",
            top: "15px",
            left: "0",
            width: "100%",
            height: "6px",
            background: "url('" + image + "') left top / " + width + "px " + (height + 6) + "px"
        });

        var head = element("div", {
            position: "absolute",
            top: "0",
            left: "0",
            width: headWidth + "px",
            height: height + "px",
            background: "url('" + image + "') 0 -6px / " + width + "px " + (height + 6) + "px"
        });

        var face = document.createElement("canvas");
        face.width = 36;
        face.height = 37;
        face.style.cssText = "position:relative;left:4px;width:36px;height:37px";
        head.appendChild(face);

        var control = element("div", {
            position: "absolute",
            inset: "0",
            cursor: "grab",
            touchAction: "none",
            outlineOffset: "6px"
        });
        control.tabIndex = 0;
        control.setAttribute("role", "slider");
        control.setAttribute("aria-label", "Happiness");
        control.setAttribute("aria-valuemin", "0");
        control.setAttribute("aria-valuemax", "100");

        base.appendChild(track);
        base.appendChild(head);
        base.appendChild(control);
        container.appendChild(base);

        function render(notify) {
            var availableWidth = Math.max(0, base.clientWidth - headWidth);
            head.style.left = Math.round(value * availableWidth) + "px";
            control.setAttribute("aria-valuenow", String(Math.round(value * 100)));
            control.setAttribute("aria-valuetext", Math.round(value * 100) + "% happy");
            drawFace(face, value);
            if (notify && onChange) onChange(value);
        }

        function resize() {
            render(false);
        }

        function setValue(nextValue, notify) {
            value = clamp(Number(nextValue), 0, 1);
            render(notify !== false);
        }

        function valueFromPointer(event) {
            var bounds = base.getBoundingClientRect();
            var availableWidth = Math.max(1, bounds.width - headWidth);
            return (event.clientX - bounds.left - headWidth / 2) / availableWidth;
        }

        function pointerDown(event) {
            event.preventDefault();
            control.setPointerCapture(event.pointerId);
            control.style.cursor = "grabbing";
            setValue(valueFromPointer(event));
        }

        function pointerMove(event) {
            if (!control.hasPointerCapture(event.pointerId)) return;
            setValue(valueFromPointer(event));
        }

        function pointerUp(event) {
            if (control.hasPointerCapture(event.pointerId)) {
                control.releasePointerCapture(event.pointerId);
            }
            control.style.cursor = "grab";
        }

        function keyDown(event) {
            var next = value;
            if (event.key === "ArrowLeft" || event.key === "ArrowDown") next -= 0.05;
            else if (event.key === "ArrowRight" || event.key === "ArrowUp") next += 0.05;
            else if (event.key === "Home") next = 0;
            else if (event.key === "End") next = 1;
            else return;

            event.preventDefault();
            setValue(next);
        }

        control.addEventListener("pointerdown", pointerDown);
        control.addEventListener("pointermove", pointerMove);
        control.addEventListener("pointerup", pointerUp);
        control.addEventListener("pointercancel", pointerUp);
        control.addEventListener("keydown", keyDown);
        window.addEventListener("resize", resize);

        this.position = function (next) {
            if (next === undefined) return value;
            if (typeof next === "function") {
                onChange = next;
                onChange(value);
                return this;
            }
            setValue(next);
            return this;
        };

        this.destroy = function () {
            window.removeEventListener("resize", resize);
            container.removeChild(base);
        };

        render(false);
    }

    function element(tagName, styles) {
        var node = document.createElement(tagName);
        Object.assign(node.style, styles);
        return node;
    }

    function clamp(value, minimum, maximum) {
        if (!Number.isFinite(value)) return minimum;
        return Math.min(maximum, Math.max(minimum, value));
    }

    function drawFace(canvas, emotion) {
        var context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);

        context.beginPath();
        context.fillStyle = "#414084";
        drawSmile(context, 15.5, 20, 0.8, emotion);
        context.fill();

        context.beginPath();
        context.lineWidth = 1;
        context.strokeStyle = "#414084";
        drawEyebrows(context, 9.5, 16, 23, 16, 7, 5, emotion);
        context.stroke();
    }

    function drawSmile(context, radius, offsetY, innerScale, emotion) {
        var eased = 1 - emotion * emotion;
        var scale = innerScale - eased * 0.4;
        var curveOffset = emotion * emotion * emotion * 0.6 + 0.1;
        drawArc(context, radius, offsetY, scale, emotion, 0, false);
        drawArc(context, radius, offsetY, scale, emotion, curveOffset, true);
    }

    function drawArc(context, radius, offsetY, innerScale, emotion, curveOffset, reverse) {
        var innerRadius = radius * innerScale;
        var padding = radius - innerRadius;
        var diameter = innerRadius * 2;
        var theta = 360 / 16;
        var emotionScale = (emotion - 0.5) * 2;
        var sides = [padding, padding + diameter];
        var controls = [
            [innerRadius * cosine(theta * 3) + padding, innerRadius * sine(theta * 3) * emotionScale + offsetY + padding - curveOffset * radius],
            [innerRadius * cosine(theta * 5) + padding + innerRadius * 2, innerRadius * sine(theta * 5) * emotionScale + offsetY + padding - curveOffset * radius]
        ];

        if (reverse) {
            sides.reverse();
            controls.reverse();
        }
        context.moveTo(sides[0], offsetY + padding);
        context.bezierCurveTo(controls[0][0], controls[0][1], controls[1][0], controls[1][1], sides[1], offsetY + padding);
    }

    function drawEyebrows(context, x1, y1, x2, y2, width, distance, emotion) {
        var angle = (emotion - 0.5) * 30;
        var halfWidth = width / 2;
        var leftStart = rotate(-halfWidth, -distance, -angle);
        var leftEnd = rotate(halfWidth, -distance, -angle);
        var rightStart = rotate(-halfWidth, -distance, angle);
        var rightEnd = rotate(halfWidth, -distance, angle);

        context.moveTo(leftStart[0] + x1, leftStart[1] + y1);
        context.lineTo(leftEnd[0] + x1, leftEnd[1] + y1);
        context.moveTo(rightStart[0] + x2, rightStart[1] + y2);
        context.lineTo(rightEnd[0] + x2, rightEnd[1] + y2);
    }

    function rotate(x, y, angle) {
        var cos = cosine(angle);
        var sin = sine(angle);
        return [x * cos - y * sin, x * sin + y * cos];
    }

    function cosine(degrees) { return Math.cos(degrees * Math.PI / 180); }
    function sine(degrees) { return Math.sin(degrees * Math.PI / 180); }

    global.SmileySlider = SmileySlider;
}(window));
