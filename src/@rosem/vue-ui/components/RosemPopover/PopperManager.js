import Popper from "popper.js";

export default class PopupManager {
  _initialized = false;
  _bindings = {};
  _activeList = [];
  _uid = 0;
  _eventBus;
  _eventListener;

  get uid() {
    this._uid.toString();
  }

  init(eventBus) {
    if (!this._initialized) {
      this._eventBus = eventBus;
      document.addEventListener(
        "click",
        (this._eventListener = this._onDocumentClick.bind(this))
      );
      this._initialized = true;
    }
  }

  nextUid() {
    return (++this._uid).toString();
  }

  destroy() {
    if (this._initialized) {
      document.removeEventListener("click", this._eventListener);
      this._initialized = false;
    }
  }

  _onDocumentClick(event) {
    for (let i = this._activeList.length; --i >= 0; ) {
      const activePopperName = this._activeList[i],
        binding = this._bindings[activePopperName];

      if (
        binding.closeOnClickOutside &&
        (!binding.popperElement.contains(event.target) ||
          binding.closeOnSelfClick) &&
        !binding.targetElement.contains(event.target)
      ) {
        this.close(activePopperName);
      }
    }
  }

  add(name, newParams) {
    let binding = this._bindings[name];
    this._bindings[name] = binding
      ? Object.assign(binding, newParams)
      : (binding = newParams);

    if (binding.targetElement && binding.popperElement) {
      binding.popper = new Popper(
        binding.targetElement,
        binding.popperElement,
        {
          // arrowElement: binding.pointerElement,
          originalPlacement: "bottom",
          placement: binding.placement,
          // flipped: false,
          // removeOnDestroy: true,
          modifiers: {
            // keepTogether: { enabled: true }
            preventOverflow: {
              padding: 0
              // disabled: true,
              // boundariesElement: document.body,
            }
          }
        }
      );
      // binding.popper.enableEventListeners();
    }
  }

  remove(name) {
    if (this._bindings[name]) {
      this._bindings[name].popper.destroy();
      delete this._bindings[name];

      if (!Object.keys(this._bindings).length) {
        this.destroy();
      }
    }
  }

  update(name) {
    this._bindings[name].popper.scheduleUpdate();
  }

  _forceOpen(name) {
    this._activeList.push(name);
    const binding = this._bindings[name];
    binding.open = true;
    this._eventBus.$emit(`rosem/popper:open::${name}`, binding);
  }

  open(name) {
    if (!this._bindings[name].open) {
      this._forceOpen(name);
    }
  }

  _forceClose(name) {
    this._activeList.splice(this._activeList.indexOf(name), 1);
    const binding = this._bindings[name];
    binding.open = false;
    this._eventBus.$emit(`rosem/popper:close::${name}`, binding);
  }

  close(name) {
    if (this._bindings[name].open) {
      this._forceClose(name);
    }
  }

  toggle(name) {
    const binding = this._bindings[name];

    binding.open && binding.closeOnControlClick
      ? this._forceClose(name)
      : this._forceOpen(name);
  }

  onOpen(name, eventListener) {
    this._eventBus.$on(`rosem/popper:open::${name}`, event => {
      this.update(name);
      eventListener(event);
    });
  }

  onClose(name, eventListener) {
    this._eventBus.$on(`rosem/popper:close::${name}`, event => {
      eventListener(event);
    });
  }
}
