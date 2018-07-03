import Popup from "./Pop";
import PopupTooltip from "./Popper";
import PopperManager from "./PopperManager";

export default {
  install(Vue) {
    const popupManager = (Vue.prototype.$_rosem_popper = new PopperManager());

    Vue.component(Popup.name, Popup);
    Vue.component(PopupTooltip.name, PopupTooltip);
    Vue.directive("pop", {
      bind(el, binding) {
        if (!binding.value) {
          throw new Error(
            "value of the v-pop directive should be provided" +
              " as a string name of a bound popup element"
          );
        }

        el.setAttribute("aria-controls", binding.value);

        const firstModifier = Object.entries(binding.modifiers)[0];

        popupManager.add(binding.value, {
          targetElement: el,
          placement: firstModifier[1] ? firstModifier[0] : ""
        });

        if (!binding.arg || binding.arg === "click") {
          el.addEventListener("click", () => {
            popupManager.toggle(binding.value);
          });
        } else if (binding.arg === "hover") {
          el.addEventListener("mouseenter", () => {
            popupManager.open(binding.value);
          });
          el.addEventListener("mouseleave", () => {
            popupManager.close(binding.value);
          });
        } else {
          throw new Error(
            'modifier of the v-pop directive should be "click" or "hover"'
          );
        }
      },

      unbind: function(target, binding) {
        popupManager.remove(binding.arg);
      }
    });
  }
};
