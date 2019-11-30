pv.Ease = (function() {

  function reverse(f) {
    return function(t) {
      return 1 - f(1 - t);
    };
  }

  function reflect(f) {
    return function(t) {
      return .5 * (t < .5 ? f(2 * t) : (2 - f(2 - 2 * t)));
    };
  }

  function poly(e) {
    return function(t) {
      return t < 0 ? 0 : t > 1 ? 1 : Math.pow(t, e);
    }
  }

  function sin(t) {
    return 1 - Math.cos(t * Math.PI / 2);
  }

  function exp(t) {
    return t ? Math.pow(2, 10 * (t - 1)) - 0.001 : 0;
  }

  function circle(t) {
    return -(Math.sqrt(1 - t * t) - 1);
  }

  function elastic(a, p) {
    var s;
    if (!p) p = 0.45;
    if (!a || a < 1) { a = 1; s = p / 4; }
    else s = p / (2 * Math.PI) * Math.asin(1 / a);
    return function(t) {
      return t <= 0 || t >= 1 ? t
        : -(a * Math.pow(2, 10 * (--t)) * Math.sin((t - s) * (2 * Math.PI) / p));
    };
  }

  function back(s) {
    if (!s) s = 1.70158;
    return function(t) {
      return t * t * ((s + 1) * t - s);
    };
  }

  function bounce(t) {
    return t < 1 / 2.75 ? 7.5625 * t * t
      : t < 2 / 2.75 ? 7.5625 * (t -= 1.5 / 2.75) * t + .75
        : t < 2.5 / 2.75 ? 7.5625 * (t -= 2.25 / 2.75) * t + .9375
          : 7.5625 * (t -= 2.625 / 2.75) * t + .984375;
  }

  var quad = poly(2),
    cubic = poly(3),
    elasticDefault = elastic(),
    backDefault = back();

  var eases = {
    "linear": pv.identity,
    "quad-in": quad,
    "quad-out": reverse(quad),
    "quad-in-out": reflect(quad),
    "quad-out-in": reflect(reverse(quad)),
    "cubic-in": cubic,
    "cubic-out": reverse(cubic),
    "cubic-in-out": reflect(cubic),
    "cubic-out-in": reflect(reverse(cubic)),
    "sin-in": sin,
    "sin-out": reverse(sin),
    "sin-in-out": reflect(sin),
    "sin-out-in": reflect(reverse(sin)),
    "exp-in": exp,
    "exp-out": reverse(exp),
    "exp-in-out": reflect(exp),
    "exp-out-in": reflect(reverse(exp)),
    "circle-in": circle,
    "circle-out": reverse(circle),
    "circle-in-out": reflect(circle),
    "circle-out-in": reflect(reverse(circle)),
    "elastic-in": elasticDefault,
    "elastic-out": reverse(elasticDefault),
    "elastic-in-out": reflect(elasticDefault),
    "elastic-out-in": reflect(reverse(elasticDefault)),
    "back-in": backDefault,
    "back-out": reverse(backDefault),
    "back-in-out": reflect(backDefault),
    "back-out-in": reflect(reverse(backDefault)),
    "bounce-in": bounce,
    "bounce-out": reverse(bounce),
    "bounce-in-out": reflect(bounce),
    "bounce-out-in": reflect(reverse(bounce))
  };

  pv.ease = function(f) {
    return eases[f];
  };

  return {
    reverse: reverse,
    reflect: reflect,
    linear: function() { return pv.identity; },
    sin: function() { return sin; },
    exp: function() { return exp; },
    circle: function() { return circle; },
    elastic: elastic,
    back: back,
    bounce: bounce,
    poly: poly
  };
})();
