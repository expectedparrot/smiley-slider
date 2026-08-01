# Smiley Slider

A dependency-free slider whose expression changes from sad to happy.

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

The slider supports mouse, touch, pen, and keyboard input. Pass a second argument to the constructor to use a different sprite image.
