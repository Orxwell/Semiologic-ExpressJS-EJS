const handlingParameters = ({ listOfParameters=[] }={}) => {
  return async (req, res, next) => {
    // Checking the types: first param
    if (!Array.isArray(listOfParameters)) {
      return res.status(500)
        .json({ error: '  ~Internal Server Error: \'listOfParameters\' must be an array.~' });
    }

    // Getting the parameters of the request
    const parameters = Object.keys(req.params);

    // Getting the length of some variables
    const expected_len = listOfParameters.length;
    const actual_len   = parameters.length;

    // Checking if the length of the list of parameters matches
    if (expected_len !== actual_len) {
      return res.status(400)
        .json({ error: `  ~Bad Request: expected ${expected_len} parameters but got ${actual_len}.~` });
    }

    // Checking if the list of parameters matches
    if (!listOfParameters.every(param => parameters.includes(param))) {
      return res.status(400)
        .json({ error: `  ~Bad Request: expected parameters ${listOfParameters} but got ${parameters}.~` });
    }

    // If all checks pass, we continue
    next();
  };
};

export default handlingParameters;

