<script>
export default {
  name: "RosemMotionVisualiser",

  render(h) {
    return this.$scopedSlots.default({
      draw: this.draw,
      clear: this.clear
    });
  },

  props: {
    canvasId: {
      type: String | Number,
      required: true
    },
    rotate: {
      type: Boolean,
      default: false
    },
    swap: {
      type: Boolean,
      default: true
    },
    boundaryOffsetX: {
      type: Number,
      default: 250
    },
    boundaryOffsetY: {
      type: Number,
      default: 250
    },
    axisThickness: {
      type: Number,
      default: 1
    },
    xAxisColor: {
      type: String,
      // default: '#fea795',
      // default: '#486887',
      default: "#bfd9df"
    },
    yAxisColor: {
      type: String,
      // default: '#fecb8d',
      default: "#bfd9df"
    },
    gridThickness: {
      type: Number,
      default: 1
    },
    gridColor: {
      type: String,
      default: "#b9cce0"
    },
    curveThickness: {
      type: Number,
      default: 3
    },
    curveColor: {
      type: String,
      // default: '#4fc08d',
      default: "#99b2c9"
    }
  },

  computed: {
    gridCellWidth() {
      return this.width / 20;
    },
    gridCellHeight() {
      return this.height / 20;
    }
  },

  methods: {
    clear() {
      this.context.beginPath();
      this.flush();
      this.drawCenter();
      this.drawAxes(this.boundaryOffsetX, this.boundaryOffsetY);
    },

    flush() {
      this.context.clearRect(0, 0, this.width, this.height);
      this.context.lineWidth = this.gridThickness;
      this.context.strokeStyle = this.gridColor;
      this.context.strokeRect(
        this.boundaryOffsetX,
        this.boundaryOffsetY,
        this.drawAreaWidth,
        this.drawAreaHeight
      );
      this.context.lineWidth = this.curveThickness;
      this.context.strokeStyle = this.curveColor;
    },

    drawAxes(x, y) {
      this.context.fillStyle = this.xAxisColor;
      this.context.fillRect(
        x,
        this.boundaryOffsetY - this.gridCellHeight / 2,
        this.axisThickness,
        this.drawAreaWidth + this.gridCellWidth
      );
      this.context.fillStyle = this.yAxisColor;
      this.context.fillRect(
        this.boundaryOffsetX - this.gridCellWidth / 2,
        y,
        this.drawAreaHeight + this.gridCellHeight,
        this.axisThickness
      );
    },

    drawCenter() {
      this.context.fillStyle = this.gridColor;
      this.context.fillRect(
        this.width / 2,
        this.width / 2 - this.gridCellWidth / 2,
        1,
        this.gridCellWidth
      );
      this.context.fillRect(
        this.height / 2 - this.gridCellHeight / 2,
        this.height / 2,
        this.gridCellHeight,
        1
      );
    },

    draw(x, y) {
      let X = this.boundaryOffsetX + this.drawAreaWidth * x,
        Y = this.boundaryOffsetY + this.drawAreaHeight * y;
      this.flush();
      this.drawCenter();
      this.drawAxes(X, Y);
      this.context.lineTo(X, Y);
      this.context.stroke();
      this.context.moveTo(X, Y);
    }
  },

  mounted() {
    this.$nextTick(() => {
      const canvas = document.getElementById(this.canvasId);
      this.context = canvas.getContext("2d");
      this.width = canvas.width;
      this.height = canvas.height;
      this.drawAreaWidth = this.width - 2 * this.boundaryOffsetX;
      this.drawAreaHeight = this.height - 2 * this.boundaryOffsetY;
      this.clear();
    });
  }
};
</script>

<style lang="postcss">
canvas {
  border-top-left-radius: 2px;
}
</style>
