<template>
  <svg :height="height"
       style="shape-rendering:geometricPrecision; text-rendering:geometricPrecision; image-rendering:optimizeQuality; fill-rule:evenodd; clip-rule:evenodd"
       version="1.1" viewBox="0 0 846.66 846.66" :width="width"  xml:space="preserve" :aria-labelledby="iconName"
       xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <title
      :id="iconName"
      lang="en"
    >{{ iconName }} icon</title>
    <g id="Layer_x0020_1" :fill="iconColor"><path class="fil0" d="M591.09 492.97c-1.63,-21.5 -32.99,-54.72 -46.79,-69.7 -85.55,-92.85 -252.06,-203.5 -370.79,-246.41 -46.9,-16.96 -78.92,-22.92 -84.93,-13.87 -6.04,9.07 11.87,36.31 45.68,73.01 87.14,94.56 249.86,202.7 370.78,246.41 8.41,3.04 83.99,31.27 86.05,10.56zm-340.32 -67.56l16.37 -24.63c-51.07,-35.08 -96.01,-71.17 -131.51,-104.66l-16.02 24.1c34.55,33.28 79.5,69.67 131.16,105.19zm50.86 -1.71l-16.37 24.63c52.78,33.88 103.74,61.23 147.78,80.2l16.03 -24.13c-44.65,-19.76 -95.33,-47.22 -147.44,-80.7zm-211.52 -133.91l15.67 -23.59 -2 -2.15c-19.15,-20.78 -33.87,-40.57 -43.45,-58.57l-11.04 16.63c-5.74,8.63 10.17,33.68 40.82,67.68zm398.1 230.53l-15.69 23.62c43.21,15.09 72.46,20.07 78.18,11.47l11.1 -16.71c-20.31,-1.85 -44.27,-7.77 -70.86,-17.38l-2.73 -1zm-433.67 -380.9c18.42,-26.39 67.84,-25.05 133.08,-1.47 125.06,45.19 297.05,159.48 387.16,257.27 22.41,24.32 38.77,47.29 47.89,67.61 58.53,6.01 108.69,16.08 144.76,28.8 44.39,15.65 70.54,37.4 70.96,63.63l0.01 71.63c0,32.52 -42.09,59.07 -110.13,75.7 -131.61,32.17 -333.13,32.17 -464.74,0 -68.04,-16.63 -110.12,-43.18 -110.12,-75.7l0 -70.99c0,-27.04 26.12,-44.65 47.92,-54.9 15.65,-7.37 35.38,-14.06 58.38,-19.88 -68.1,-43.96 -140.24,-98.29 -195.22,-157.95 -47.41,-51.46 -67.74,-96.83 -49.73,-123.92 13.04,-19.63 26.16,-40.77 39.78,-59.83zm569.98 379.72l-39.29 59.13c-18.03,27.12 -67.76,25.96 -133.58,2.17 -40.75,-14.72 -89.24,-37.92 -140.69,-67.85 -38.79,6.86 -70.42,15.72 -91.96,25.86 -15.39,7.24 -24.09,13.3 -24.09,17.45 0,10.9 29.94,23.67 78.35,35.5 124.66,30.46 320.63,30.46 445.29,0 48.4,-11.83 78.35,-24.6 78.35,-35.5 0,-6.72 -15.99,-15.59 -43.26,-25.2 -30.89,-10.89 -73.47,-19.73 -123.47,-25.47 -0.99,5.05 -2.85,9.7 -5.65,13.91zm-149.37 165.47l0 -29.49c-61.83,-0.95 -119.21,-6.15 -167.37,-14.43l0 28.98c47.1,8.55 104.63,13.95 167.37,14.94zm41.51 -29.49l0 29.49c62.73,-0.99 120.27,-6.39 167.37,-14.94l0 -28.98c-48.16,8.28 -105.54,13.48 -167.37,14.43zm-250.38 5.52l0 -28.37 -2.75 -0.67c-27.45,-6.71 -50.68,-15.03 -68.62,-24.71l0 20c0,10.36 27.08,22.42 71.37,33.75zm459.25 -28.37l0 28.37c44.29,-11.33 71.37,-23.39 71.37,-33.75l0 -20c-17.95,9.68 -41.17,18 -68.63,24.71l-2.74 0.67z"/></g></svg>
</template>

<script>
export default {
  props: {
    iconName: {
      type: String,
      default: 'coins'
    },
    width: {
      type: [Number, String],
      default: 18
    },
    height: {
      type: [Number, String],
      default: 18
    },
    iconColor: {
      type: String,
      default: 'currentColor'
    }
  }
}
</script>
