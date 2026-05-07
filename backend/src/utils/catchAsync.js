/**
 * Wrapper để loại bỏ try-catch lặp đi lặp lại trong các Controller
 */
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
