(function (global) {
    "use strict";

    var SVG_NAMESPACE = "http://www.w3.org/2000/svg";

    function SmileySlider(container) {
        if (!(container instanceof Element)) {
            throw new TypeError("SmileySlider requires a container element");
        }

        var width = 329;
        var height = 48;
        var headSize = 40;
        var maximumHeadX = width - headSize;
        var value = 0.5;
        var onChange = null;

        var svg = svgElement("svg", {
            viewBox: "0 0 " + width + " " + height,
            role: "slider",
            tabindex: "0",
            "aria-label": "Happiness",
            "aria-valuemin": "0",
            "aria-valuemax": "100",
            preserveAspectRatio: "xMidYMid meet"
        });
        svg.style.cssText = "display:block;width:100%;height:auto;overflow:visible;cursor:grab;touch-action:none;outline-offset:6px";

        var track = svgElement("line", {
            x1: headSize / 2,
            y1: height / 2,
            x2: width - headSize / 2,
            y2: height / 2,
            stroke: "#aaa8c9",
            "stroke-width": "3",
            "stroke-linecap": "round"
        });

        var face = svgElement("g");
        var head = svgElement("circle", {
            cx: headSize / 2,
            cy: height / 2,
            r: "18.5",
            fill: "white",
            stroke: "#414084",
            "stroke-width": "1.5"
        });
        var leftEye = svgElement("circle", { cx: "14", cy: "22", r: "1.5", fill: "#414084" });
        var rightEye = svgElement("circle", { cx: "26", cy: "22", r: "1.5", fill: "#414084" });
        var leftEyebrow = svgElement("line", {
            x1: "10.5", y1: "17", x2: "17.5", y2: "17",
            stroke: "#414084", "stroke-width": "1.5", "stroke-linecap": "round"
        });
        var rightEyebrow = svgElement("line", {
            x1: "22.5", y1: "17", x2: "29.5", y2: "17",
            stroke: "#414084", "stroke-width": "1.5", "stroke-linecap": "round"
        });
        var mouth = svgElement("path", {
            fill: "none",
            stroke: "#414084",
            "stroke-width": "2",
            "stroke-linecap": "round"
        });

        face.appendChild(head);
        face.appendChild(leftEye);
        face.appendChild(rightEye);
        face.appendChild(leftEyebrow);
        face.appendChild(rightEyebrow);
        face.appendChild(mouth);
        svg.appendChild(track);
        svg.appendChild(face);
        container.appendChild(svg);

        function render(notify) {
            var x = value * maximumHeadX;
            var eyebrowAngle = (value - 0.5) * 28;
            var mouthControlY = 18 + value * 22;

            face.setAttribute("transform", "translate(" + x + " 0)");
            leftEyebrow.setAttribute("transform", "rotate(" + -eyebrowAngle + " 14 17)");
            rightEyebrow.setAttribute("transform", "rotate(" + eyebrowAngle + " 26 17)");
            mouth.setAttribute("d", "M 10 30 Q 20 " + mouthControlY + " 30 30");
            svg.setAttribute("aria-valuenow", String(Math.round(value * 100)));
            svg.setAttribute("aria-valuetext", Math.round(value * 100) + "% happy");

            if (notify && onChange) onChange(value);
        }

        function setValue(nextValue, notify) {
            value = clamp(Number(nextValue), 0, 1);
            render(notify !== false);
        }

        function valueFromPointer(event) {
            var bounds = svg.getBoundingClientRect();
            var scale = width / bounds.width;
            var svgX = (event.clientX - bounds.left) * scale;
            return (svgX - headSize / 2) / maximumHeadX;
        }

        function pointerDown(event) {
            event.preventDefault();
            svg.setPointerCapture(event.pointerId);
            svg.style.cursor = "grabbing";
            setValue(valueFromPointer(event));
        }

        function pointerMove(event) {
            if (svg.hasPointerCapture(event.pointerId)) setValue(valueFromPointer(event));
        }

        function pointerUp(event) {
            if (svg.hasPointerCapture(event.pointerId)) svg.releasePointerCapture(event.pointerId);
            svg.style.cursor = "grab";
        }

        function keyDown(event) {
            var next = value;
            if (event.key === "ArrowLeft" || event.key === "ArrowDown") next -= 0.05;
            else if (event.key === "ArrowRight" || event.key === "ArrowUp") next += 0.05;
            else if (event.key === "PageDown") next -= 0.1;
            else if (event.key === "PageUp") next += 0.1;
            else if (event.key === "Home") next = 0;
            else if (event.key === "End") next = 1;
            else return;

            event.preventDefault();
            setValue(next);
        }

        svg.addEventListener("pointerdown", pointerDown);
        svg.addEventListener("pointermove", pointerMove);
        svg.addEventListener("pointerup", pointerUp);
        svg.addEventListener("pointercancel", pointerUp);
        svg.addEventListener("keydown", keyDown);

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
            container.removeChild(svg);
        };

        render(false);
    }

    function svgElement(tagName, attributes) {
        var node = document.createElementNS(SVG_NAMESPACE, tagName);
        Object.keys(attributes || {}).forEach(function (name) {
            node.setAttribute(name, attributes[name]);
        });
        return node;
    }

    function clamp(value, minimum, maximum) {
        if (!Number.isFinite(value)) return minimum;
        return Math.min(maximum, Math.max(minimum, value));
    }

    global.SmileySlider = SmileySlider;
}(window));
