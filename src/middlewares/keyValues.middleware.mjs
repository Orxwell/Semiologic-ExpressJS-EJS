const handlingKeyValues = ({ listOfKeys=[], method }={}) => {
  return async (req, res, next) => {
    // Mappping HTTP methods
    const HTTP_METHODS_OPTION = {
      'GET' : req.query,
      'POST': req.body ,
      // Implements another method if it's needed
    };

    // Checking the types: first param
    if (!Array.isArray(listOfKeys)) {
      return res.status(500)
        .json({ error: '  ~Internal Server Error: \'listOfKeys\' must be an array.~' });
    }

    // Checking the types: second param
    const methodType = method.toUpperCase();
    if (!Object.keys(HTTP_METHODS_OPTION).includes(methodType)) {
      return res.status(500)
        .json({ error: `  ~Internal Server Error: \'methodType=${methodType}\' not supported.~` });
    }

    // Getting the keys of the request
    const givenKeys = Object.keys(HTTP_METHODS_OPTION[methodType]);

    // Getting the length of some variables
    const expected_len = listOfKeys.length;
    const actual_len   = givenKeys.length ;

    // Checking if the length of the list of keys matches
    if (expected_len !== actual_len) {
      return res.status(400)
        .json({ error: `  ~Bad Request: expected ${expected_len} keys but got ${actual_len}.~` });
    }

    // Checking if the list of keys matches
    if (!listOfKeys.every(param => givenKeys.includes(param))) {
      return res.status(400)
        .json({ error: `  ~Bad Request: expected keys ${listOfKeys} but got ${givenKeys}.~` });
    }

    // If all checks pass, we continue
    next();
  };
};

export default handlingKeyValues;
