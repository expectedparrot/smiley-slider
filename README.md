# Smiley Slider

A dependency-free SVG slider whose expression changes from sad to happy.

[Try the live demo](https://expectedparrot.github.io/smiley-slider/)

## Usage

```html
<div id="slider"></div>
<script src="smiley-slider.js"></script>
<script>
  const slider = new SmileySlider(document.getElementById("slider"));

  slider.position(0);   // sad
  slider.position(1);   // happy

  const value = slider.position();
  slider.position(value / 2);

  slider.position((value) => {
    // Called whenever the value changes.
  });
</script>
```

The slider supports mouse, touch, pen, and keyboard input. Its track, head, eyes, eyebrows, and continuously changing mouth are rendered as inline SVG, so no image assets are required.
