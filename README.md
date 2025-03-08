# CountUp.js
CountUp.js is a dependency-free, lightweight Javascript class that can be used to quickly create animations that display numerical data in a more interesting way.

Despite its name, CountUp can count in either direction, depending on the start and end values that you pass.

CountUp.js supports all browsers. MIT license.

## Fork Details

This is a fork of [**countUp.js**](https://inorganik.github.io/countUp.js), with a couple tweaks for simpler usage with finicky build systems.

> In short, I'm using the old-school way of importing the code. Don't hate me :sweat_smile:

While using this module with **Hugo**, I was having major problems trying to integrate the forked repo into a website. Seemingly, this is because the Hugo javascript-builder (for "production" build) would not play nice with importing code outside the assets directory.

:point_right: This fork makes it so countUp.js is not a module, but rather just a function on the `window` object.

### Include the script

In the page header (`layouts/partials/head/js.html` for this Hugo site) just add a `<script>` tag for CountUp:

```html
<script src="js/countUp.min.js" type="module"></script>
{{- with resources.Get "js/main.js" }}
  {{- if eq hugo.Environment "development" }}
    {{- with . | js.Build }}
      <script src="{{ .RelPermalink }}" defer></script>
    {{- end }}
  {{- else }}
    {{- $opts := dict "minify" true }}
    {{- with . | js.Build $opts | fingerprint }}
      <script src="{{ .RelPermalink }}" integrity="{{- .Data.Integrity }}" crossorigin="anonymous"></script>
    {{- end }}
  {{- end }}
{{- end }}
<!-- ... -->
```

### Use the script

To use this script, just create a `new CountUp` somewhere. This code runs on the `DOMContentLoaded` event, and utilizes scrollspy to trigger Countup only when the registered elements come into view:

```js
function scrollspyCounters() {
    // Find all of the elements marked for use with CountUp
    const elements = document.querySelectorAll('.counter-number.countup');
    const observer = new IntersectionObserver((entries, observer) => {
        // For each of the elements, define a callback for when it comes into view
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const ele = entry.target;
                const numStr = ele.getAttribute('data-countup-number');
                const num = numStr ? parseFloat(numStr) : 0;
                const suff = ele.getAttribute('data-countup-suffix') || "";
                const options = { suffix: suff };
                const countUp = new CountUp(ele, num, options);
                // Start counting up!
                countUp.start();
                // Only countup each element once per page load.
                observer.unobserve(ele);
            }
        });
    }, { threshold: 0.5 }); // Trigger when 50% of the element is visible
    elements.forEach(ele => observer.observe(ele));
}
```

It should work without too much fussin'

![modified countup](modified countup.gif)
