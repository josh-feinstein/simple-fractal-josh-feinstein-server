module.exports = {
  calculatePercentile: function(numberOfValuesBelow, totalNumberOfValues) {
    return ((numberOfValuesBelow / totalNumberOfValues) * 100).toFixed(2);
  },
};
