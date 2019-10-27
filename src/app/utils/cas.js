// Prototype that stores information about a given polynomial.
function Polynomial(data) {
  // Support providing already existing Polynomials.
  this.polynomial = data instanceof Polynomial ? data.polynomial : data;
}

// Rank all coefficients in the polynomial and return the largest.
Polynomial.prototype.getLargestCoefficient = function() {
  var re = /(\d+)/g, match, max = 0;
  while(match = re.exec(this.getPolynomial()))
    max = Math.max(max, match[1]);
  return max;
};

// Returns the polynomial as plain text.
Polynomial.prototype.getPolynomial = function() {
  return this.polynomial;
};

// Replaces x for a given value and evaluates the polynomial as a JavaScript expression.
Polynomial.prototype.insert = function(val) {
  return eval(this.getPolynomial().replace(/x/g, val));
};

// To differentiate we just insert an arbitrary small value as the delta x and evaluate it.
Polynomial.prototype.differentiate = function(val) {
  return (this.insert(val) - this.insert(val + 0.001)) / -0.001;
};

// Prototype that stores information about a given equation.
function Equation(data) {
  // Support providing already existing Equations.
  data = data instanceof Equation ? data.polynomial : data;
  // Move everything over to the left side of the equation and set equal to zero.
  data = data.replace(/(.*)=(.*)/, '$1-($2)');
  // We internally store equations as a polynomial set equal to zero.
  this.polynomial = new Polynomial(data);
}

// Evaluates the left side polynomial of the equation.
Equation.prototype.insert = function(val) {
  return this.polynomial.evaluate(val);
};

// Solves the equation using Newtons method.
Equation.prototype.solve = function(errorTreshold, guess, maxIterations) {
  // Set default error treshold value.
  errorTreshold = errorTreshold || 0.1;

  console.log("hallo");
  // Pick largest coefficient as initial guess. It gives some basic
  // understanding over what scale of numbers we are dealing with.
  guess = guess || this.polynomial.getLargestCoefficient();

  // Set default value for maximum number of iterations before timeout.
  maxIterations = maxIterations || 1000;

  // Loop requires number or it will stop prematurely.
  var error = errorTreshold + 1;

  // Store iterations to detect timeouts.
  var iteration = 0;

  // Run iterations of Newtons method.
  while (error >= errorTreshold && iteration <= maxIterations) {
    error = this.polynomial.insert(guess) / this.polynomial.differentiate(guess);
    guess = guess - error;
    console.log(guess);
    iteration += 1;
  }

  // Return our final guess.
  return guess;
};

// Export to Node environment.
module.exports = {
  Polynomial: Polynomial,
  Equation: Equation
};
