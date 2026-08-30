const labels = {
  armorTop: "Top armor",
  armorBottom: "Bottom armor",
};
const handler = {
  get: function (target, prop, receiver) {
    if (prop in target) {
      return target[prop];
    }
    return prop[0].toUpperCase() + prop.slice(1);
  },
};

export default new Proxy(labels, handler);
