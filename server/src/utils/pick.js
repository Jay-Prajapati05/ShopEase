// Copy only the allowed keys from an object
const pick = (obj, keys) =>
  keys.reduce((result, key) => {
    if (Object.hasOwn(obj, key) && obj[key] !== undefined) {
      result[key] = obj[key];
    }
    return result;
  }, {});

export default pick;